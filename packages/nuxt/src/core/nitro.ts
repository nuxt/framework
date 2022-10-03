import { existsSync, promises as fsp } from 'node:fs'
import { resolve, join } from 'pathe'
import { createNitro, createDevServer, build, prepare, copyPublicAssets, writeTypes, scanHandlers, prerender, Nitro } from 'nitropack'
import type { NitroEventHandler, NitroDevEventHandler, NitroConfig } from 'nitropack'
import type { Nuxt } from '@nuxt/schema'
import { resolvePath } from '@nuxt/kit'
import defu from 'defu'
import fsExtra from 'fs-extra'
import { toEventHandler, dynamicEventHandler } from 'h3'
import { distDir } from '../dirs'
import { ImportProtectionPlugin } from './plugins/import-protection'

export async function initNitro (nuxt: Nuxt & { _nitro?: Nitro }) {
  // Resolve handlers
  const { handlers, devHandlers } = await resolveHandlers(nuxt)

  // Resolve config
  const _nitroConfig = ((nuxt.options as any).nitro || {}) as NitroConfig
  const nitroConfig: NitroConfig = defu(_nitroConfig, <NitroConfig>{
    rootDir: nuxt.options.rootDir,
    workspaceDir: nuxt.options.workspaceDir,
    srcDir: join(nuxt.options.srcDir, 'server'),
    dev: nuxt.options.dev,
    preset: nuxt.options.dev ? 'nitro-dev' : undefined,
    buildDir: nuxt.options.buildDir,
    analyze: nuxt.options.build.analyze && {
      template: 'treemap',
      projectRoot: nuxt.options.rootDir,
      filename: join(nuxt.options.rootDir, '.nuxt/stats', '{name}.html')
    },
    scanDirs: nuxt.options._layers.map(layer => layer.config.srcDir).filter(Boolean).map(dir => join(dir!, 'server')),
    renderer: resolve(distDir, 'core/runtime/nitro/renderer'),
    errorHandler: resolve(distDir, 'core/runtime/nitro/error'),
    nodeModulesDirs: nuxt.options.modulesDir,
    handlers,
    devHandlers: [],
    baseURL: nuxt.options.app.baseURL,
    virtual: {},
    runtimeConfig: {
      ...nuxt.options.runtimeConfig,
      nitro: {
        envPrefix: 'NUXT_',
        ...nuxt.options.runtimeConfig.nitro
      }
    },
    typescript: {
      generateTsConfig: false
    },
    publicAssets: [
      { dir: resolve(nuxt.options.buildDir, 'dist/client') },
      ...nuxt.options._layers
        .map(layer => join(layer.config.srcDir, layer.config.dir?.public || 'public'))
        .filter(dir => existsSync(dir))
        .map(dir => ({ dir }))
    ],
    prerender: {
      crawlLinks: nuxt.options._generate ? nuxt.options.generate.crawler : false,
      routes: ([] as string[])
        .concat(nuxt.options.generate.routes)
        .concat(nuxt.options._generate ? [nuxt.options.ssr ? '/' : '/index.html', '/200.html', '/404.html'] : [])
    },
    sourceMap: nuxt.options.sourcemap.server,
    externals: {
      inline: [
        ...(nuxt.options.dev
          ? []
          : [
              ...nuxt.options.experimental.externalVue ? [] : ['vue', '@vue/'],
              '@nuxt/',
              nuxt.options.buildDir
            ]),
        'nuxt/dist',
        'nuxt3/dist',
        distDir
      ]
    },
    alias: {
      ...nuxt.options.experimental.externalVue
        ? {}
        : {

            'vue/compiler-sfc': 'vue/compiler-sfc',
            'vue/server-renderer': 'vue/server-renderer',
            vue: await resolvePath(`vue/dist/vue.cjs${nuxt.options.dev ? '' : '.prod'}.js`)
          },
      // Vue 3 mocks
      'estree-walker': 'unenv/runtime/mock/proxy',
      '@babel/parser': 'unenv/runtime/mock/proxy',
      '@vue/compiler-core': 'unenv/runtime/mock/proxy',
      '@vue/compiler-dom': 'unenv/runtime/mock/proxy',
      '@vue/compiler-ssr': 'unenv/runtime/mock/proxy',
      '@vue/devtools-api': 'vue-devtools-stub',

      // Paths
      '#paths': resolve(distDir, 'core/runtime/nitro/paths'),

      // Nuxt aliases
      ...nuxt.options.alias
    },
    replace: {
      'process.env.NUXT_NO_SSR': nuxt.options.ssr === false,
      'process.env.NUXT_NO_SCRIPTS': !!nuxt.options.experimental.noScripts && !nuxt.options.dev,
      'process.env.NUXT_INLINE_STYLES': !!nuxt.options.experimental.inlineSSRStyles,
      'process.env.NUXT_PAYLOAD_EXTRACTION': !!nuxt.options.experimental.payloadExtraction,
      'process.dev': nuxt.options.dev,
      __VUE_PROD_DEVTOOLS__: false
    },
    rollupConfig: {
      plugins: []
    }
  })

  // Add fallback server for `ssr: false`
  if (!nuxt.options.ssr) {
    nitroConfig.virtual!['#build/dist/server/server.mjs'] = 'export default () => {}'
  }

  if (!nuxt.options.experimental.inlineSSRStyles) {
    nitroConfig.virtual!['#build/dist/server/styles.mjs'] = 'export default {}'
  }

  // Register nuxt protection patterns
  nitroConfig.rollupConfig!.plugins!.push(ImportProtectionPlugin.rollup({
    rootDir: nuxt.options.rootDir,
    patterns: [
      ...['#app', /^#build(\/|$)/]
        .map(p => [p, 'Vue app aliases are not allowed in server routes.']) as [RegExp | string, string][]
    ],
    exclude: [/core[\\/]runtime[\\/]nitro[\\/]renderer/]
  }))

  // Extend nitro config with hook
  await nuxt.callHook('nitro:config', nitroConfig)

  // Init nitro
  const nitro = await createNitro(nitroConfig)

  // Expose nitro to modules and kit
  nuxt._nitro = nitro
  await nuxt.callHook('nitro:init', nitro)

  // Connect vfs storages
  nitro.vfs = nuxt.vfs = nitro.vfs || nuxt.vfs || {}

  // Connect hooks
  nuxt.hook('close', () => nitro.hooks.callHook('close'))

  // Setup handlers
  const devMiddlewareHandler = dynamicEventHandler()
  nitro.options.devHandlers.unshift({ handler: devMiddlewareHandler })
  nitro.options.devHandlers.push(...devHandlers)
  nitro.options.handlers.unshift({
    route: '/__nuxt_error',
    lazy: true,
    handler: resolve(distDir, 'core/runtime/nitro/renderer')
  })

  // Add typed route responses
  nuxt.hook('prepare:types', async (opts) => {
    if (!nuxt.options.dev) {
      await scanHandlers(nitro)
      await writeTypes(nitro)
    }
    opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/nitro.d.ts') })
  })

  // nuxt build/dev
  nuxt.hook('build:done', async () => {
    await nuxt.callHook('nitro:build:before', nitro)
    if (nuxt.options.dev) {
      await build(nitro)
    } else {
      await prepare(nitro)
      await copyPublicAssets(nitro)
      await prerender(nitro)
      if (!nuxt.options._generate) {
        await build(nitro)
      } else {
        const distDir = resolve(nuxt.options.rootDir, 'dist')
        if (!existsSync(distDir)) {
          await fsp.symlink(nitro.options.output.publicDir, distDir, 'junction').catch(() => {})
        }
      }
    }
  })

  // nuxt dev
  if (nuxt.options.dev) {
    nuxt.hook('build:compile', ({ compiler }) => {
      compiler.outputFileSystem = { ...fsExtra, join } as any
    })
    nuxt.hook('server:devMiddleware', (m) => { devMiddlewareHandler.set(toEventHandler(m)) })
    nuxt.server = createDevServer(nitro)
    nuxt.hook('build:resources', () => {
      nuxt.server.reload()
    })
    const waitUntilCompile = new Promise<void>(resolve => nitro.hooks.hook('compiled', () => resolve()))
    nuxt.hook('build:done', () => waitUntilCompile)
  }
}

async function resolveHandlers (nuxt: Nuxt) {
  const handlers: NitroEventHandler[] = [...nuxt.options.serverHandlers]
  const devHandlers: NitroDevEventHandler[] = [...nuxt.options.devServerHandlers]

  // Map legacy serverMiddleware to handlers
  for (let m of nuxt.options.serverMiddleware) {
    if (typeof m === 'string' || typeof m === 'function' /* legacy middleware */) { m = { handler: m } }
    const route = m.path || m.route || '/'
    const handler = m.handler || m.handle
    if (typeof handler !== 'string' || typeof route !== 'string') {
      devHandlers.push({ route, handler })
    } else {
      delete m.handler
      delete m.path
      handlers.push({
        ...m,
        route,
        middleware: true,
        handler: await resolvePath(handler)
      })
    }
  }

  return {
    handlers,
    devHandlers
  }
}
