import { resolve, join } from 'pathe'
import { createNitro, createDevServer, build, prepare, copyPublicAssets, NitroHandlerConfig, writeTypes, scanHandlers, prerender } from 'nitropack'
import type { NitroConfig } from 'nitropack'
import type { Nuxt } from '@nuxt/schema'
import { resolvePath } from '@nuxt/kit'
import defu from 'defu'
import fsExtra from 'fs-extra'
import { distDir } from '../dirs'
import { ImportProtectionPlugin } from './plugins/import-protection'

export async function initNitro (nuxt: Nuxt) {
  const _nitroConfig = ((nuxt.options as any).nitro || {}) as NitroConfig
  const nitroConfig: NitroConfig = defu(_nitroConfig, <NitroConfig>{
    rootDir: nuxt.options.rootDir,
    srcDir: join(nuxt.options.srcDir, 'server'),
    dev: nuxt.options.dev,
    preset: nuxt.options.dev ? 'dev' : undefined,
    scanDirs: nuxt.options._layers.map(layer => join(layer.config.srcDir, 'server')),
    buildDir: nuxt.options.buildDir,
    generateDir: join(nuxt.options.buildDir, 'dist'),
    publicDir: nuxt.options.dir.public,
    publicPath: nuxt.options.app.buildAssetsDir,
    renderer: resolve(distDir, 'core/runtime/nitro/renderer'),
    modulesDir: nuxt.options.modulesDir,
    runtimeConfig: {
      public: nuxt.options.publicRuntimeConfig,
      private: nuxt.options.privateRuntimeConfig
    },
    prerender: {
      crawlLinks: nuxt.options.generate.crawler,
      routes: nuxt.options.generate.routes
    },
    output: {
      dir: nuxt.options.dev ? join(nuxt.options.buildDir, 'nitro') : resolve(nuxt.options.rootDir, '.output')
    },
    externals: {
      inline: nuxt.options.dev ? [] : [nuxt.options.buildDir]
    },
    alias: {
      // TODO: #590
      'vue/server-renderer': 'vue/server-renderer',
      'vue/compiler-sfc': 'vue/compiler-sfc',
      vue: await resolvePath(`vue/dist/vue.cjs${nuxt.options.dev ? '' : '.prod'}.js`),

      // Vue 3 mocks
      'estree-walker': 'unenv/runtime/mock/proxy',
      '@babel/parser': 'unenv/runtime/mock/proxy',
      '@vue/compiler-core': 'unenv/runtime/mock/proxy',
      '@vue/compiler-dom': 'unenv/runtime/mock/proxy',
      '@vue/compiler-ssr': 'unenv/runtime/mock/proxy',
      '@vue/devtools-api': 'unenv/runtime/mock/proxy',

      // Renderer
      '#vue-renderer': resolve(distDir, 'core/runtime/nitro/vue3'),

      // Error renderer
      '#nitro-error': resolve(distDir, 'core/runtime/nitro/error')
    }
  })

  const nitro = await createNitro(nitroConfig)

  // Create dev server
  const nitroDevServer = nuxt.server = createDevServer(nitro)

  // Connect vfs storages
  nitro.vfs = nuxt.vfs = nitro.vfs || nuxt.vfs || {}

  // Connect hooks
  const nitroHooks = [
    'nitro:document'
  ]
  nuxt.hook('close', () => nitro.hooks.callHook('close'))
  for (const hook of nitroHooks) {
    nitro.hooks.hook(hook as any, (...args) => nuxt.callHook(hook as any, ...args))
  }

  // @ts-ignore
  nuxt.hook('close', () => nitro.hooks.callHook('close'))
  nitro.hooks.hook('nitro:document', template => nuxt.callHook('nitro:document', template))

  // Register nuxt3 protection patterns
  nitro.hooks.hook('nitro:rollup:before', (nitro) => {
    nitro.options.rollupConfig.plugins.push(ImportProtectionPlugin.rollup({
      rootDir: nuxt.options.rootDir,
      patterns: [
        ...['#app', /^#build(\/|$)/]
          .map(p => [p, 'Vue app aliases are not allowed in server routes.']) as [RegExp | string, string][]
      ]
    }))
  })

  // Add typed route responses
  nuxt.hook('prepare:types', async (opts) => {
    if (nuxt.options._prepare) {
      await scanHandlers(nitro)
      await writeTypes(nitro)
    }
    opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/nitro.d.ts') })
  })

  // Wait for all modules to be ready
  nuxt.hook('modules:done', async () => {
    // Extend nitro with modules
    await nuxt.callHook('nitro:context', nitro)

    // Resolve middleware
    const { middleware, legacyMiddleware } = await resolveHandlers(nuxt)
    nuxt.server.setLegacyMiddleware(legacyMiddleware)
    nitro.options.handlers.push(...middleware)
    nitro.options.handlers.unshift({
      route: '/_nitro',
      lazy: true,
      handler: resolve(distDir, 'core/runtime/nitro/renderer')
    })
  })

  // nuxt build/dev
  nuxt.hook('build:done', async () => {
    if (nuxt.options.dev) {
      await build(nitro)
    } else {
      await prepare(nitro)
      await copyPublicAssets(nitro)
      await build(nitro)
      if (nuxt.options._generate) {
        await prerender(nitro)
      }
    }
  })

  // nuxt dev
  if (nuxt.options.dev) {
    nitro.hooks.hook('nitro:compiled', () => { nitroDevServer.watch() })
    nuxt.hook('build:compile', ({ compiler }) => {
      compiler.outputFileSystem = { ...fsExtra, join } as any
    })
    nuxt.hook('server:devMiddleware', (m) => { nitroDevServer.setDevMiddleware(m) })
    const waitUntilCompile = new Promise<void>(resolve => nitro.hooks.hook('nitro:compiled', () => resolve()))
    nuxt.hook('build:done', () => waitUntilCompile)
  }
}

async function resolveHandlers (nuxt: Nuxt) {
  const middleware: NitroHandlerConfig[] = []
  const legacyMiddleware: NitroHandlerConfig[] = []

  for (let m of nuxt.options.serverMiddleware) {
    if (typeof m === 'string' || typeof m === 'function' /* legacy middleware */) { m = { handler: m } }
    const route = m.path || m.route || '/'
    const handle = m.handler || m.handle
    if (typeof handle !== 'string' || typeof route !== 'string') {
      legacyMiddleware.push(m)
    } else {
      delete m.handler
      delete m.path
      middleware.push({
        ...m,
        route,
        handler: await resolvePath(handle)
      })
    }
  }

  return {
    middleware,
    legacyMiddleware
  }
}
