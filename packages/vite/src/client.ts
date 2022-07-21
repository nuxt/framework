import { join, resolve } from 'pathe'
import * as vite from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import viteJsxPlugin from '@vitejs/plugin-vue-jsx'
import type { Connect } from 'vite'
import { logger } from '@nuxt/kit'
import { getPort } from 'get-port-please'
import { joinURL, withLeadingSlash, withoutLeadingSlash, withTrailingSlash } from 'ufo'
import escapeRE from 'escape-string-regexp'
import { cacheDirPlugin } from './plugins/cache-dir'
import { analyzePlugin } from './plugins/analyze'
import { wpfs } from './utils/wpfs'
import type { ViteBuildContext, ViteOptions } from './vite'
import { writeManifest } from './manifest'
import { devStyleSSRPlugin } from './plugins/dev-ssr-css'
import { viteNodePlugin } from './vite-node'

export async function buildClient (ctx: ViteBuildContext) {
  const hmrPortDefault = 24678 // Vite's default HMR port
  const hmrPort = await getPort({
    port: hmrPortDefault,
    ports: Array.from({ length: 20 }, (_, i) => hmrPortDefault + 1 + i)
  })
  const clientConfig: vite.InlineConfig = vite.mergeConfig(ctx.config, {
    experimental: {
      renderBuiltUrl: (filename, { type, hostType }) => {
        if (hostType !== 'js' || type === 'asset') {
          // In CSS we only use relative paths until we craft a clever runtime CSS hack
          return { relative: true }
        }
        return { runtime: `globalThis.__publicAssetsURL(${JSON.stringify(filename)})` }
      }
    },
    define: {
      'process.server': false,
      'process.client': true,
      'module.hot': false
    },
    resolve: {
      alias: {
        '#build/plugins': resolve(ctx.nuxt.options.buildDir, 'plugins/client'),
        '#internal/nitro': resolve(ctx.nuxt.options.buildDir, 'nitro.client.mjs')
      }
    },
    build: {
      rollupOptions: {
        output: {
          // https://github.com/vitejs/vite/tree/main/packages/vite/src/node/build.ts#L464-L478
          assetFileNames: ctx.nuxt.options.dev ? undefined : withoutLeadingSlash(join(ctx.nuxt.options.app.buildAssetsDir, '[name].[hash].[ext]')),
          chunkFileNames: ctx.nuxt.options.dev ? undefined : withoutLeadingSlash(join(ctx.nuxt.options.app.buildAssetsDir, '[name].[hash].mjs')),
          entryFileNames: ctx.nuxt.options.dev ? 'entry.mjs' : withoutLeadingSlash(join(ctx.nuxt.options.app.buildAssetsDir, '[name].[hash].mjs'))
        }
      },
      manifest: true,
      outDir: resolve(ctx.nuxt.options.buildDir, 'dist/client')
    },
    plugins: [
      cacheDirPlugin(ctx.nuxt.options.rootDir, 'client'),
      vuePlugin(ctx.config.vue),
      viteJsxPlugin(),
      devStyleSSRPlugin({
        rootDir: ctx.nuxt.options.rootDir,
        buildAssetsURL: joinURL(ctx.nuxt.options.app.baseURL, ctx.nuxt.options.app.buildAssetsDir)
      }),
      viteNodePlugin(ctx)
    ],
    appType: 'custom',
    server: {
      hmr: {
        // https://github.com/nuxt/framework/issues/4191
        protocol: 'ws',
        clientPort: hmrPort,
        port: hmrPort
      },
      middlewareMode: true
    }
  } as ViteOptions)

  // In build mode we explicitly override any vite options that vite is relying on
  // to detect whether to inject production or development code (such as HMR code)
  if (!ctx.nuxt.options.dev) {
    clientConfig.server.hmr = false
  }

  // Add analyze plugin if needed
  if (ctx.nuxt.options.build.analyze) {
    clientConfig.plugins.push(...analyzePlugin(ctx))
  }

  await ctx.nuxt.callHook('vite:extendConfig', clientConfig, { isClient: true, isServer: false })

  if (ctx.nuxt.options.dev) {
    // Dev
    const viteServer = await vite.createServer(clientConfig)
    ctx.clientServer = viteServer
    await ctx.nuxt.callHook('vite:serverCreated', viteServer, { isClient: true, isServer: false })
    const BASE_RE = new RegExp(`^${escapeRE(withTrailingSlash(withLeadingSlash(joinURL(ctx.nuxt.options.app.baseURL, ctx.nuxt.options.app.buildAssetsDir))))}`)
    const viteMiddleware: Connect.NextHandleFunction = (req, res, next) => {
      // Workaround: vite devmiddleware modifies req.url
      const originalURL = req.url
      req.url = req.url.replace(BASE_RE, '/')
      viteServer.middlewares.handle(req, res, (err) => {
        req.url = originalURL
        next(err)
      })
    }
    await ctx.nuxt.callHook('server:devMiddleware', viteMiddleware)

    ctx.nuxt.hook('close', async () => {
      await viteServer.close()
    })
  } else {
    // Build
    const start = Date.now()
    await vite.build(clientConfig)
    await ctx.nuxt.callHook('build:resources', wpfs)
    logger.info(`Client built in ${Date.now() - start}ms`)
  }

  await writeManifest(ctx)
}
