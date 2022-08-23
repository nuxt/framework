import { normalize, resolve } from 'pathe'
import { createHooks } from 'hookable'
import type { Nuxt, NuxtOptions, NuxtConfig, ModuleContainer, NuxtHooks } from '@nuxt/schema'
import { loadNuxtConfig, LoadNuxtOptions, nuxtCtx, installModule, addComponent, addVitePlugin, addWebpackPlugin, tryResolveModule } from '@nuxt/kit'
// Temporary until finding better placement
/* eslint-disable import/no-restricted-paths */
import escapeRE from 'escape-string-regexp'
import pagesModule from '../pages/module'
import metaModule from '../head/module'
import componentsModule from '../components/module'
import importsModule from '../imports/module'
/* eslint-enable */
import { distDir, pkgDir } from '../dirs'
import { version } from '../../package.json'
import { ImportProtectionPlugin, vueAppPatterns } from './plugins/import-protection'
import { UnctxTransformPlugin } from './plugins/unctx'
import { TreeShakePlugin } from './plugins/tree-shake'
import { addModuleTranspiles } from './modules'
import { initNitro } from './nitro'

export function createNuxt (options: NuxtOptions): Nuxt {
  const hooks = createHooks<NuxtHooks>()

  const nuxt: Nuxt = {
    _version: version,
    options,
    hooks,
    callHook: hooks.callHook,
    addHooks: hooks.addHooks,
    hook: hooks.hook,
    ready: () => initNuxt(nuxt),
    close: () => Promise.resolve(hooks.callHook('close', nuxt)),
    vfs: {}
  }

  return nuxt
}

async function initNuxt (nuxt: Nuxt) {
  // Register user hooks
  nuxt.hooks.addHooks(nuxt.options.hooks)

  // Set nuxt instance for useNuxt
  nuxtCtx.set(nuxt)
  nuxt.hook('close', () => nuxtCtx.unset())

  // Add nuxt types
  nuxt.hook('prepare:types', (opts) => {
    opts.references.push({ types: 'nuxt' })
    opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/plugins.d.ts') })
    // Add vue shim
    if (nuxt.options.typescript.shim) {
      opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/vue-shim.d.ts') })
    }
    // Add module augmentations directly to NuxtConfig
    opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/schema.d.ts') })
    opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/app.config.d.ts') })
  })

  // Add import protection
  const config = {
    rootDir: nuxt.options.rootDir,
    patterns: vueAppPatterns(nuxt)
  }
  addVitePlugin(ImportProtectionPlugin.vite(config))
  addWebpackPlugin(ImportProtectionPlugin.webpack(config))

  // Add unctx transform
  addVitePlugin(UnctxTransformPlugin(nuxt).vite({ sourcemap: nuxt.options.sourcemap }))
  addWebpackPlugin(UnctxTransformPlugin(nuxt).webpack({ sourcemap: nuxt.options.sourcemap }))

  if (!nuxt.options.dev) {
    const removeFromServer = ['onBeforeMount', 'onMounted', 'onBeforeUpdate', 'onRenderTracked', 'onRenderTriggered', 'onActivated', 'onDeactivated', 'onBeforeUnmount']
    const removeFromClient = ['onServerPrefetch', 'onRenderTracked', 'onRenderTriggered']

    // Add tree-shaking optimisations for SSR - build time only
    addVitePlugin(TreeShakePlugin.vite({ sourcemap: nuxt.options.sourcemap, treeShake: removeFromServer }), { client: false })
    addVitePlugin(TreeShakePlugin.vite({ sourcemap: nuxt.options.sourcemap, treeShake: removeFromClient }), { server: false })
    addWebpackPlugin(TreeShakePlugin.webpack({ sourcemap: nuxt.options.sourcemap, treeShake: removeFromServer }), { client: false })
    addWebpackPlugin(TreeShakePlugin.webpack({ sourcemap: nuxt.options.sourcemap, treeShake: removeFromClient }), { server: false })
  }

  // Transpile layers within node_modules
  nuxt.options.build.transpile.push(
    ...nuxt.options._layers.filter(i => i.cwd.includes('node_modules')).map(i => i.cwd as string)
  )

  // Init user modules
  await nuxt.callHook('modules:before', { nuxt } as ModuleContainer)
  const modulesToInstall = [
    ...nuxt.options.buildModules,
    ...nuxt.options.modules,
    ...nuxt.options._modules
  ]

  // Add <NuxtWelcome>
  addComponent({
    name: 'NuxtWelcome',
    filePath: tryResolveModule('@nuxt/ui-templates/templates/welcome.vue')!
  })

  addComponent({
    name: 'NuxtLayout',
    filePath: resolve(nuxt.options.appDir, 'components/layout')
  })

  // Add <NuxtErrorBoundary>
  addComponent({
    name: 'NuxtErrorBoundary',
    filePath: resolve(nuxt.options.appDir, 'components/nuxt-error-boundary')
  })

  // Add <ClientOnly>
  addComponent({
    name: 'ClientOnly',
    filePath: resolve(nuxt.options.appDir, 'components/client-only')
  })

  // Add <ServerPlaceholder>
  addComponent({
    name: 'ServerPlaceholder',
    filePath: resolve(nuxt.options.appDir, 'components/server-placeholder')
  })

  // Add <NuxtLink>
  addComponent({
    name: 'NuxtLink',
    filePath: resolve(nuxt.options.appDir, 'components/nuxt-link')
  })

  // Add <NuxtLoadingIndicator>
  addComponent({
    name: 'NuxtLoadingIndicator',
    filePath: resolve(nuxt.options.appDir, 'components/nuxt-loading-indicator')
  })

  for (const m of modulesToInstall) {
    if (Array.isArray(m)) {
      await installModule(m[0], m[1])
    } else {
      await installModule(m, {})
    }
  }

  await nuxt.callHook('modules:done', { nuxt } as ModuleContainer)

  // Normalize windows transpile paths added by modules
  nuxt.options.build.transpile = nuxt.options.build.transpile.map(t => typeof t === 'string' ? normalize(t) : t)

  addModuleTranspiles()

  // Init nitro
  await initNitro(nuxt)

  await nuxt.callHook('ready', nuxt)
}

export async function loadNuxt (opts: LoadNuxtOptions): Promise<Nuxt> {
  const options = await loadNuxtConfig(opts)

  // Temporary until finding better placement for each
  options.appDir = options.alias['#app'] = resolve(distDir, 'app')
  options._majorVersion = 3
  options._modules.push(pagesModule, metaModule, componentsModule)
  options._modules.push([importsModule, {
    transform: {
      include: options._layers
        .filter(i => i.cwd && i.cwd.includes('node_modules'))
        .map(i => new RegExp(`(^|\\/)${escapeRE(i.cwd!.split('node_modules/').pop()!)}(\\/|$)(?!node_modules\\/)`))
    }
  }])
  options.modulesDir.push(resolve(pkgDir, 'node_modules'))
  options.build.transpile.push('@nuxt/ui-templates')
  options.alias['vue-demi'] = resolve(options.appDir, 'compat/vue-demi')
  options.alias['@vue/composition-api'] = resolve(options.appDir, 'compat/capi')
  if (options.telemetry !== false && !process.env.NUXT_TELEMETRY_DISABLED) {
    options._modules.push('@nuxt/telemetry')
  }

  const nuxt = createNuxt(options)

  if (opts.ready !== false) {
    await nuxt.ready()
  }

  return nuxt
}

export function defineNuxtConfig (config: NuxtConfig): NuxtConfig {
  return config
}

// For a convenience import together with `defineNuxtConfig`
export type { NuxtConfig }
