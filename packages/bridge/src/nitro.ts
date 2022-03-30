import { promises as fsp } from 'fs'
import fetch from 'node-fetch'
import fsExtra from 'fs-extra'
import { addPluginTemplate, resolvePath, useNuxt } from '@nuxt/kit'
import { joinURL, stringifyQuery, withoutTrailingSlash } from 'ufo'
import { resolve, join } from 'pathe'
import { createNitro, createDevServer, build, writeTypes, prepare, copyPublicAssets, prerender } from 'nitropack'
import type { Nitro, NitroConfig, NitroHandlerConfig } from 'nitropack'
import { Nuxt } from '@nuxt/schema'
import defu from 'defu'
import { AsyncLoadingPlugin } from './async-loading'
import { distDir } from './dirs'
import { isDirectory, readDirRecursively } from './vite/utils/fs'

export async function setupNitroBridge () {
  const nuxt = useNuxt()

  // Ensure we're not just building with 'static' target
  if (!nuxt.options.dev && nuxt.options.target === 'static' && !nuxt.options._prepare && !(nuxt.options as any)._export && !nuxt.options._legacyGenerate) {
    throw new Error('[nitro] Please use `nuxt generate` for static target')
  }

  // Handle legacy property name `assetsPath`
  nuxt.options.app.buildAssetsDir = nuxt.options.app.buildAssetsDir || nuxt.options.app.assetsPath
  nuxt.options.app.assetsPath = nuxt.options.app.buildAssetsDir
  nuxt.options.app.baseURL = nuxt.options.app.baseURL || (nuxt.options.app as any).basePath
  // Nitro expects app config on `config.app` rather than `config._app`
  nuxt.options.publicRuntimeConfig.app = nuxt.options.publicRuntimeConfig.app || {}
  Object.assign(nuxt.options.publicRuntimeConfig.app, nuxt.options.publicRuntimeConfig._app)

  // Disable loading-screen
  // @ts-ignore
  nuxt.options.build.loadingScreen = false
  // @ts-ignore
  nuxt.options.build.indicator = false

  if (nuxt.options.build.analyze === true) {
    const { rootDir } = nuxt.options
    nuxt.options.build.analyze = {
      template: 'treemap',
      projectRoot: rootDir,
      filename: join(rootDir, '.nuxt/stats', '{name}.html')
    }
  }

  // Create contexts
  const _nitroConfig = (nuxt.options as any).nitro || {} as NitroConfig
  const nitroConfig: NitroConfig = defu(_nitroConfig, {
    rootDir: resolve(nuxt.options.rootDir),
    srcDir: resolve(nuxt.options.srcDir, 'server'),
    dev: nuxt.options.dev,
    preset: nuxt.options.dev ? 'dev' : undefined,
    buildDir: resolve(nuxt.options.buildDir),
    scanDirs: nuxt.options._layers.map(layer => join(layer.config.srcDir, 'server')),
    generateDir: resolve(nuxt.options.buildDir, 'dist'),
    publicDir: nuxt.options.dir.public,
    publicPath: nuxt.options.app.buildAssetsDir,
    renderer: resolve(distDir, 'runtime/nitro/renderer'),
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
    alias: {
      // Vue 2 mocks
      encoding: 'unenv/runtime/mock/proxy',
      he: 'unenv/runtime/mock/proxy',
      resolve: 'unenv/runtime/mock/proxy',
      'source-map': 'unenv/runtime/mock/proxy',
      'lodash.template': 'unenv/runtime/mock/proxy',
      'serialize-javascript': 'unenv/runtime/mock/proxy',

      // Renderer
      '#vue-renderer': resolve(distDir, 'runtime/nitro/vue2'),
      '#vue2-server-renderer': 'vue-server-renderer/' + (nuxt.options.dev ? 'build.dev.js' : 'build.prod.js')
    }

  })

  // Initiate nitro
  const nitro = await createNitro(nitroConfig)

  // Shared vfs storage
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

  // Use custom document template if provided
  if (nuxt.options.appTemplatePath) {
    nuxt.hook('nitro:document', async (template) => {
      template.src = nuxt.options.appTemplatePath
      template.contents = await fsp.readFile(nuxt.options.appTemplatePath, 'utf-8')
    })
  }

  async function updateViteBase () {
    const clientDist = resolve(nuxt.options.buildDir, 'dist/client')

    // Remove public files that have been duplicated into buildAssetsDir
    // TODO: Add option to configure this behaviour in vite
    const publicDir = join(nuxt.options.srcDir, nuxt.options.dir.static)
    let publicFiles: string[] = []
    if (await isDirectory(publicDir)) {
      publicFiles = readDirRecursively(publicDir).map(r => r.replace(publicDir, ''))
      for (const file of publicFiles) {
        try {
          fsExtra.rmSync(join(clientDist, file))
        } catch {}
      }
    }

    // Copy doubly-nested /_nuxt/_nuxt files into buildAssetsDir
    // TODO: Workaround vite issue
    if (await isDirectory(clientDist)) {
      const nestedAssetsPath = withoutTrailingSlash(join(clientDist, nuxt.options.app.buildAssetsDir))

      if (await isDirectory(nestedAssetsPath)) {
        await fsExtra.copy(nestedAssetsPath, clientDist, { recursive: true })
        await fsExtra.remove(nestedAssetsPath)
      }
    }
  }
  nuxt.hook('nitro:generate', updateViteBase)
  nuxt.hook('generate:before', updateViteBase)

  // Expose process.env.NITRO_PRESET
  nuxt.options.env.NITRO_PRESET = nitro.options.preset

  // .ts is supported for serverMiddleware
  nuxt.options.extensions.push('ts')

  // Replace nuxt server
  if (nuxt.server) {
    nuxt.server.__closed = true
    nuxt.server = createNuxt2DevServer(nitro)
  }

  // Disable server sourceMap, esbuild will generate for it.
  nuxt.hook('webpack:config', (webpackConfigs) => {
    const serverConfig = webpackConfigs.find(config => config.name === 'server')
    if (serverConfig) {
      serverConfig.devtool = false
    }
  })

  // Set up webpack plugin for node async loading
  nuxt.hook('webpack:config', (webpackConfigs) => {
    const serverConfig = webpackConfigs.find(config => config.name === 'server')
    if (serverConfig) {
      serverConfig.plugins = serverConfig.plugins || []
      serverConfig.plugins.push(new AsyncLoadingPlugin({
        modulesDir: nuxt.options.modulesDir
      }) as any)
    }
  })

  // Nitro client plugin
  addPluginTemplate({
    filename: 'nitro-bridge.client.mjs',
    src: resolve(distDir, 'runtime/nitro-bridge.client.mjs')
  })

  // Nitro server plugin (for vue-meta)
  addPluginTemplate({
    filename: 'nitro-bridge.server.mjs',
    src: resolve(distDir, 'runtime/nitro-bridge.server.mjs')
  })

  // Fix module resolution
  nuxt.hook('webpack:config', (configs) => {
    for (const config of configs) {
      // We use only object form of alias in base config
      if (Array.isArray(config.resolve.alias)) { return }
      config.resolve.alias.ufo = 'ufo/dist/index.mjs'
      config.resolve.alias.ohmyfetch = 'ohmyfetch/dist/index.mjs'
    }
  })

  // Generate mjs resources
  nuxt.hook('build:compiled', async ({ name }) => {
    if (nuxt.options._prepare) { return }
    if (name === 'server') {
      const jsServerEntry = resolve(nuxt.options.buildDir, 'dist/server/server.js')
      await fsp.writeFile(jsServerEntry.replace(/.js$/, '.cjs'), 'module.exports = require("./server.js")', 'utf8')
      await fsp.writeFile(jsServerEntry.replace(/.js$/, '.mjs'), 'export { default } from "./server.cjs"', 'utf8')
    } else if (name === 'client') {
      const manifest = await fsp.readFile(resolve(nuxt.options.buildDir, 'dist/server/client.manifest.json'), 'utf8')
      await fsp.writeFile(resolve(nuxt.options.buildDir, 'dist/server/client.manifest.mjs'), 'export default ' + manifest, 'utf8')
    }
  })

  // Wait for all modules to be ready
  nuxt.hook('modules:done', async () => {
    // Extend nitro with modules
    await nuxt.callHook('nitro:context', nitro)

    // Resolve middleware
    const { middleware, legacyMiddleware } = await resolveHandlers(nuxt)
    if (nuxt.server) {
      nuxt.server.setLegacyMiddleware(legacyMiddleware)
    }
    nitro.options.handlers.push(...middleware)
  })

  // Add typed route responses
  nuxt.hook('prepare:types', (opts) => {
    opts.references.push({ path: resolve(nuxt.options.buildDir, 'types/nitro.d.ts') })
  })

  // nuxt prepare
  nuxt.hook('build:done', async () => {
    await writeTypes(nitro)
  })

  // nuxt build/dev
  // @ts-ignore
  nuxt.options.build._minifyServer = false
  nuxt.options.build.standalone = false

  const waitUntilCompile = new Promise<void>(resolve => nitro.hooks.hook('nitro:compiled', () => resolve()))
  nuxt.hook('build:done', async () => {
    if (nuxt.options._prepare) { return }
    if (nuxt.options.dev) {
      await build(nitro)
      await waitUntilCompile
      // nitro.hooks.callHook('nitro:dev:reload')
    } else {
      await prepare(nitro)
      await copyPublicAssets(nitro)
      if (nuxt.options.target === 'static') {
        await prerender(nitro)
      }
      await build(nitro)
      if (nuxt.options._generate) {
        await prerender(nitro)
      }
    }
  })

  // nuxt dev
  if (nuxt.options.dev) {
    nitro.hooks.hook('nitro:compiled', () => { nuxt.server?.watch() })
    nuxt.hook('build:compile', ({ compiler }) => {
      compiler.outputFileSystem = { ...fsExtra, join } as any
    })
    nuxt.hook('server:devMiddleware', (m) => { nuxt.server?.setDevMiddleware(m) })
  }

  // nuxt generate
  nuxt.options.generate.dir = nitro.options.output.publicDir
  nuxt.options.generate.manifest = false
  nuxt.hook('generate:cache:ignore', (ignore: string[]) => {
    ignore.push(nitro.options.output.dir)
    ignore.push(nitro.options.output.serverDir)
    if (nitro.options.output.publicDir) {
      ignore.push(nitro.options.output.publicDir)
    }
    ignore.push(...nitro.options.ignore)
  })
  nuxt.hook('generate:before', async () => {
    console.log('generate:before')
    await prepare(nitro)
  })
  nuxt.hook('generate:extendRoutes', async () => {
    console.log('generate:extendRoutes')
    await build(nitro)
    await nuxt.server.reload()
  })
  nuxt.hook('generate:done', async () => {
    console.log('generate:done')
    await nuxt.server.close()
    await build(nitro)
  })
}

function createNuxt2DevServer (nitro: Nitro) {
  const server = createDevServer(nitro)

  const listeners = []
  async function listen (port) {
    const listener = await server.listen(port, {
      showURL: false,
      isProd: true
    })
    listeners.push(listener)
    return listener
  }

  async function renderRoute (route = '/', renderContext = {}) {
    const [listener] = listeners
    if (!listener) {
      throw new Error('There is no server listener to call `server.renderRoute()`')
    }
    const res = await fetch(joinURL(listener.url, route), {
      headers: { 'nuxt-render-context': stringifyQuery(renderContext) }
    })

    const html = await res.text()

    if (!res.ok) { return { html, error: res.statusText } }

    return { html }
  }

  return {
    ...server,
    listeners,
    renderRoute,
    listen,
    serverMiddlewarePaths () { return [] },
    ready () { }
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
