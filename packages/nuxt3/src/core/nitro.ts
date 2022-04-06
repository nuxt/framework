import { existsSync } from 'fs'
import { resolve, join } from 'pathe'
import { createNitro, createDevServer, build, prepare, copyPublicAssets, writeTypes, scanHandlers, prerender } from 'nitropack'
import type { NitroEventHandler, NitroDevEventHandler, NitroConfig } from 'nitropack'
import type { Nuxt } from '@nuxt/schema'
import { resolveModule, resolvePath } from '@nuxt/kit'
import defu from 'defu'
import fsExtra from 'fs-extra'
import { toEventHandler, dynamicEventHandler } from 'h3'
import { distDir } from '../dirs'
import { ImportProtectionPlugin } from './plugins/import-protection'

export async function initNitro (nuxt: Nuxt) {
  // Resolve config
  const _nitroConfig = ((nuxt.options as any).nitro || {}) as NitroConfig
  const nitroConfig: NitroConfig = defu(_nitroConfig, <NitroConfig>{
    rootDir: nuxt.options.rootDir,
    srcDir: join(nuxt.options.srcDir, 'server'),
    dev: nuxt.options.dev,
    preset: nuxt.options.dev ? 'nitro-dev' : undefined,
    buildDir: nuxt.options.buildDir,
    scanDirs: nuxt.options._layers.map(layer => join(layer.config.srcDir, 'server')),
    renderer: resolve(distDir, 'core/runtime/nitro/renderer'),
    nodeModulesDirs: nuxt.options.modulesDir,
    handlers: [],
    devHandlers: [],
    baseURL: nuxt.options.app.baseURL,
    runtimeConfig: {
      // Private
      ...nuxt.options.publicRuntimeConfig,
      ...nuxt.options.privateRuntimeConfig,
      // Public
      public: {
        ...nuxt.options.publicRuntimeConfig,
        app: undefined // avoid dupicate
      },
      // Nitro
      NITRO_ENV_PREFIX_ALT: 'NUXT_'
    },
    typescript: {
      generateTsConfig: false
    },
    publicAssets: [
      {
        baseURL: nuxt.options.app.buildAssetsDir,
        dir: resolve(nuxt.options.buildDir, 'dist/client')
      },
      ...nuxt.options._layers
        .map(layer => join(layer.config.srcDir, 'public'))
        .filter(dir => existsSync(dir))
        .map(dir => ({ dir }))
    ],
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
      '#nitro/error': resolve(distDir, 'core/runtime/nitro/error'),

      // Paths
      '#paths': resolve(distDir, 'core/runtime/nitro/paths')
    },
    replace: {
      'process.env.NUXT_NO_SSR': nuxt.options.ssr === false ? true : undefined
    }
  })

  // Extend nitro config with hook
  await nuxt.callHook('nitro:config', nitroConfig)

  // Init nitro
  const nitro = await createNitro(nitroConfig)

  // Expose nitro to modules
  await nuxt.callHook('nitro:init', nitro)

  // Connect vfs storages
  nitro.vfs = nuxt.vfs = nitro.vfs || nuxt.vfs || {}

  // Connect hooks
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

  // Setup handlers
  const devMidlewareHandler = dynamicEventHandler()
  nitro.options.devHandlers.unshift({ handler: devMidlewareHandler })
  const { handlers, devHandlers } = await resolveHandlers(nuxt)
  nitro.options.handlers.push(...handlers)
  nitro.options.devHandlers.push(...devHandlers)
  nitro.options.handlers.unshift({
    route: '/_nitro',
    lazy: true,
    handler: resolve(distDir, 'core/runtime/nitro/renderer')
  })

  // Add typed route responses
  nuxt.hook('prepare:types', async (opts) => {
    if (nuxt.options._prepare) {
      await scanHandlers(nitro)
      await writeTypes(nitro)
    }
    const nitroRuntimeIndex = resolveModule('nitropack/dist/runtime/index', { paths: nuxt.options.modulesDir })
    opts.tsConfig.compilerOptions.paths['#nitro'] = [nitroRuntimeIndex]
    opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/nitro.d.ts') })
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
    nuxt.hook('build:compile', ({ compiler }) => {
      compiler.outputFileSystem = { ...fsExtra, join } as any
    })
    nuxt.hook('server:devMiddleware', (m) => { devMidlewareHandler.set(toEventHandler(m)) })
    nuxt.server = createDevServer(nitro)
    nuxt.hook('build:resources', () => {
      nuxt.server.reload()
    })
    const waitUntilCompile = new Promise<void>(resolve => nitro.hooks.hook('nitro:compiled', () => resolve()))
    nuxt.hook('build:done', () => waitUntilCompile)
  }
}

async function resolveHandlers (nuxt: Nuxt) {
  const handlers: NitroEventHandler[] = []
  const devHandlers: NitroDevEventHandler[] = []

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
        handler: await resolvePath(handler)
      })
    }
  }

  return {
    handlers,
    devHandlers
  }
}
