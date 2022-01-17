import type { IncomingMessage, ServerResponse } from 'http'
import pify from 'pify'
import webpack from 'webpack'
import webpackDevMiddleware, { API } from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import consola from 'consola'

import type { Compiler, Watching } from 'webpack'

import type { Nuxt } from '@nuxt/schema'
import { joinURL } from 'ufo'
import { DynamicBasePlugin } from '../../vite/src/plugins/dynamic-base'
import { createMFS } from './utils/mfs'
import { client, server } from './configs'
import { createWebpackConfigContext, applyPresets, getWebpackConfig } from './utils/config'

// TODO: Support plugins
// const plugins: string[] = []

export async function bundle (nuxt: Nuxt) {
  // Initialize shared MFS for dev
  const mfs = nuxt.options.dev ? createMFS() : null

  // Initialize virtual modules instance
  const virtualModules = new VirtualModulesPlugin(nuxt.vfs)
  const writeFiles = () => {
    for (const filePath in nuxt.vfs) {
      virtualModules.writeModule(filePath, nuxt.vfs[filePath])
    }
  }
  // Workaround to initialize virtual modules
  nuxt.hook('build:compile', ({ compiler }) => {
    if (compiler.name === 'server') { writeFiles() }
  })
  // Update virtual modules when templates are updated
  nuxt.hook('app:templatesGenerated', writeFiles)

  const compilersWatching: Watching[] = []

  async function webpackCompile (compiler: Compiler) {
    const { name } = compiler.options

    await nuxt.callHook('build:compile', { name, compiler })

    // Load renderer resources after build
    compiler.hooks.done.tap('load-resources', async (stats) => {
      await nuxt.callHook('build:compiled', { name, compiler, stats })
      // Reload renderer
      await nuxt.callHook('build:resources', mfs)
    })

    // --- Dev Build ---
    if (nuxt.options.dev) {
      // Client build
      if (name === 'client') {
        return new Promise((resolve, reject) => {
          compiler.hooks.done.tap('nuxt-dev', () => { resolve(null) })
          compiler.hooks.failed.tap('nuxt-errorlog', (err) => { reject(err) })
          // Start watch
          webpackDev(compiler)
        })
      }

      // Server, build and watch for changes
      return new Promise((resolve, reject) => {
        const watching = compiler.watch(nuxt.options.watchers.webpack, (err) => {
          if (err) { return reject(err) }
          resolve(null)
        })

        compilersWatching.push(watching)
      })
    }

    // --- Production Build ---
    const stats = await pify(compiler.run)()

    if (stats.hasErrors()) {
      // non-quiet mode: errors will be printed by webpack itself
      const error = new Error('Nuxt build error')
      if (nuxt.options.build.quiet === true) {
        error.stack = stats.toString('errors-only')
      }
      throw error
    }

    // Await for renderer to load resources (programmatic, tests and generate)
    await nuxt.callHook('build:resources')
  }

  async function webpackDev (compiler: Compiler) {
    consola.debug('Creating webpack middleware...')

    const { name } = compiler.options

    // Create webpack dev middleware
    const devMiddleware = pify(webpackDevMiddleware(compiler, {
      // TODO: waiting for https://github.com/nuxt/framework/pull/2249
      publicPath: joinURL(nuxt.options.app.baseURL, nuxt.options.app.buildAssetsDir),
      outputFileSystem: mfs as any,
      stats: 'none',
      ...nuxt.options.webpack.devMiddleware
    })) as API<IncomingMessage, ServerResponse>

    compilersWatching.push(devMiddleware.context.watching)
    nuxt.hook('close', () => pify(devMiddleware.close)())

    const { client: _client, ...hotMiddlewareOptions } = nuxt.options.webpack.hotMiddleware || {}
    const hotMiddleware = pify(webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 10000,
      path: joinURL(nuxt.options.app.baseURL, '__webpack_hmr', name),
      ...hotMiddlewareOptions
    }))

    // Register devMiddleware on server
    await nuxt.callHook('server:devMiddleware', async (req, res, next) => {
      for (const mw of [devMiddleware, hotMiddleware]) {
        await mw?.(req, res)
      }
      next()
    })
  }

  const webpackConfigs = [client, ...nuxt.options.ssr ? [server] : []].map((preset) => {
    const ctx = createWebpackConfigContext(nuxt)
    applyPresets(ctx, preset)
    return getWebpackConfig(ctx)
  })

  await nuxt.callHook('webpack:config', webpackConfigs)

  // Configure compilers
  const compilers = webpackConfigs.map((config) => {
    // Support virtual modules (input)
    config.plugins.push(virtualModules)

    config.plugins.push(DynamicBasePlugin.webpack({
      env: nuxt.options.dev ? 'dev' : config.name as 'client',
      devAppConfig: nuxt.options.app,
      globalPublicPath: '__webpack_public_path__'
    }))

    // Create compiler
    const compiler = webpack(config)

    // In dev, write files in memory FS
    if (nuxt.options.dev) {
      compiler.outputFileSystem = mfs
    }

    return compiler
  })

  nuxt.hook('close', async () => {
    for (const compiler of compilers) {
      await new Promise(resolve => compiler.close(resolve))
    }
    await Promise.all(compilersWatching.map(watching => pify(watching.close)()))
  })

  // Start Builds
  if (nuxt.options.dev) {
    return Promise.all(compilers.map(c => webpackCompile(c)))
  }

  for (const c of compilers) {
    await webpackCompile(c)
  }
}
