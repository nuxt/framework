import { useNuxt, resolveModule, addTemplate, resolveAlias, extendWebpackConfig } from '@nuxt/kit'
import { NuxtModule } from '@nuxt/schema'
import { resolve } from 'pathe'
import { componentsTypeTemplate } from '../../nuxt3/src/components/templates'
import { schemaTemplate } from '../../nuxt3/src/core/templates'
import { distDir } from './dirs'

export function setupAppBridge (_options: any) {
  const nuxt = useNuxt()

  // Setup aliases
  nuxt.options.alias['#app'] = resolve(distDir, 'runtime/index')
  nuxt.options.alias['nuxt3/app'] = nuxt.options.alias['#app']
  nuxt.options.alias['nuxt/app'] = nuxt.options.alias['#app']
  nuxt.options.alias['#build'] = nuxt.options.buildDir

  // Mock `bundleBuilder.build` to support `nuxi prepare`
  if (nuxt.options._prepare) {
    nuxt.hook('builder:prepared', (builder) => {
      builder.bundleBuilder.build = () => Promise.resolve(builder.bundleBuilder)
    })
  }

  // Resolve vue2 builds
  const vue2ESM = resolveModule('vue/dist/vue.runtime.esm.js', { paths: nuxt.options.modulesDir })
  const vue2CJS = resolveModule('vue/dist/vue.runtime.common.js', { paths: nuxt.options.modulesDir })
  nuxt.options.alias.vue2 = vue2ESM
  nuxt.options.build.transpile.push('vue')

  extendWebpackConfig((config) => {
    (config.resolve.alias as any).vue2 = vue2CJS
  }, { client: false })
  nuxt.hook('vite:extendConfig', (config, { isServer }) => {
    if (isServer && !nuxt.options.dev) {
      (config.resolve.alias as any).vue2 = vue2CJS
    }
  })

  // Disable legacy fetch polyfills
  nuxt.options.fetch.server = false
  nuxt.options.fetch.client = false

  // Setup types for components
  const components = []
  nuxt.hook('components:extend', (registeredComponents) => {
    components.push(...registeredComponents)
  })
  addTemplate({
    ...componentsTypeTemplate,
    options: { components, buildDir: nuxt.options.buildDir }
  })
  nuxt.hook('prepare:types', ({ references }) => {
    references.push({ path: resolve(nuxt.options.buildDir, 'types/components.d.ts') })
  })

  // Augment schema with module types
  nuxt.hook('modules:done', async (container: any) => {
    nuxt.options._installedModules = await Promise.all(Object.values(container.requiredModules).map(async (m: { src: string, handler: NuxtModule }) => ({
      meta: await m.handler.getMeta?.(),
      entryPath: resolveAlias(m.src, nuxt.options.alias)
    })))
    addTemplate(schemaTemplate)
  })
  nuxt.hook('prepare:types', ({ references }) => {
    // Add module augmentations directly to NuxtConfig
    references.push({ path: resolve(nuxt.options.buildDir, 'types/schema.d.ts') })
  })

  // Alias vue to have identical vue3 exports
  nuxt.options.alias['vue2-bridge'] = resolve(distDir, 'runtime/vue2-bridge.mjs')
  for (const alias of [
    // vue
    'vue',
    // vue 3 helper packages
    '@vue/shared',
    '@vue/reactivity',
    '@vue/runtime-core',
    '@vue/runtime-dom',
    // vue-demi
    'vue-demi',
    ...[
      // vue 2 dist files
      'vue/dist/vue.common.dev',
      'vue/dist/vue.common',
      'vue/dist/vue.common.prod',
      'vue/dist/vue.esm.browser',
      'vue/dist/vue.esm.browser.min',
      'vue/dist/vue.esm',
      'vue/dist/vue',
      'vue/dist/vue.min',
      'vue/dist/vue.runtime.common.dev',
      'vue/dist/vue.runtime.common',
      'vue/dist/vue.runtime.common.prod',
      'vue/dist/vue.runtime.esm',
      'vue/dist/vue.runtime',
      'vue/dist/vue.runtime.min'
    ].flatMap(m => [m, `${m}.js`])
  ]) {
    nuxt.options.alias[alias] = nuxt.options.alias['vue2-bridge']
  }

  // Ensure TS still recognises vue imports
  nuxt.hook('prepare:types', ({ tsConfig }) => {
    tsConfig.compilerOptions.paths.vue2 = ['vue']
    delete tsConfig.compilerOptions.paths.vue

    // @ts-ignore
    tsConfig.vueCompilerOptions = {
      experimentalCompatMode: 2
    }
  })

  // Deprecate various Nuxt options
  if (nuxt.options.globalName !== 'nuxt') {
    throw new Error('Custom global name is not supported by @nuxt/bridge.')
  }

  // Fix wp4 esm
  nuxt.hook('webpack:config', (configs) => {
    for (const config of configs.filter(c => c.module)) {
      // @ts-ignore
      const jsRule: any = config.module.rules.find(rule => rule.test instanceof RegExp && rule.test.test('index.mjs'))
      jsRule.type = 'javascript/auto'

      config.module.rules.unshift({
        test: /\.mjs$/,
        type: 'javascript/auto',
        include: [/node_modules/]
      })
    }
  })
}
