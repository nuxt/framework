import { resolve } from 'pathe'
import * as vite from 'vite'
import { isIgnored, logger } from '@nuxt/kit'
import { NuxtConfigSchema } from '@nuxt/schema'
import { applyDefaults } from 'untyped'
import { sanitizeFilePath } from 'mlly'
import { getPort } from 'get-port-please'
import { distDir } from '../dirs'
import { warmupViteServer } from '../../../vite/src/utils/warmup'
import { DynamicBasePlugin } from '../../../vite/src/plugins/dynamic-base'
import { buildClient } from './client'
import { buildServer } from './server'
import { defaultExportPlugin } from './plugins/default-export'
import { jsxPlugin } from './plugins/jsx'
import { replace } from './plugins/replace'
import { resolveCSSOptions } from './css'
import type { Nuxt, ViteBuildContext, ViteOptions } from './types'
import { prepareManifests } from './manifest'

async function bundle (nuxt: Nuxt, builder: any) {
  for (const p of builder.plugins) {
    p.src = nuxt.resolver.resolvePath(resolve(nuxt.options.buildDir, p.src))
  }

  // TODO: After nitropack refactor, try if we can resuse the same server port as Nuxt
  const hmrPortDefault = 24678 // Vite's default HMR port
  const hmrPort = await getPort({
    port: hmrPortDefault,
    ports: Array.from({ length: 20 }, (_, i) => hmrPortDefault + 1 + i)
  })

  nuxt.options.vite = applyDefaults(NuxtConfigSchema, { ...nuxt.options, server: {} }).vite

  const ctx: ViteBuildContext = {
    nuxt,
    builder,
    config: vite.mergeConfig(
      {
        define: {
          'process.static': nuxt.options.target === 'static',
          'process.env.NODE_ENV': JSON.stringify(nuxt.options.dev ? 'development' : 'production'),
          'process.mode': JSON.stringify(nuxt.options.dev ? 'development' : 'production'),
          'process.target': JSON.stringify(nuxt.options.target)
        },
        resolve: {
          alias: {
            ...nuxt.options.alias,
            '#build': nuxt.options.buildDir,
            '.nuxt': nuxt.options.buildDir,
            '/entry.mjs': resolve(nuxt.options.buildDir, 'client.js'),
            'web-streams-polyfill/ponyfill/es2018': resolve(distDir, 'runtime/vite/mock/web-streams-polyfill.mjs'),
            'whatwg-url': resolve(distDir, 'runtime/vite/mock/whatwg-url.mjs'),
            // Cannot destructure property 'AbortController' of ..
            'abort-controller': resolve(distDir, 'runtime/vite/mock/abort-controller.mjs')
          }
        },
        optimizeDeps: {
          exclude: [
            'ufo',
            'date-fns',
            'nanoid',
            'vue'
            // TODO(Anthony): waiting for Vite's fix https://github.com/vitejs/vite/issues/5688
            // ...nuxt.options.build.transpile.filter(i => typeof i === 'string'),
            // 'vue-demi'
          ]
        },
        css: resolveCSSOptions(nuxt),
        build: {
          rollupOptions: {
            output: { sanitizeFileName: sanitizeFilePath }
          }
        },
        plugins: [
          replace({
            __webpack_public_path__: 'globalThis.__webpack_public_path__'
          }),
          jsxPlugin(),
          DynamicBasePlugin.vite(),
          defaultExportPlugin()
        ],
        server: {
          watch: {
            ignored: isIgnored
          },
          hmr: {
            clientPort: hmrPort,
            port: hmrPort
          },
          fs: {
            allow: [
              nuxt.options.rootDir
            ]
          }
        }
      } as ViteOptions,
      nuxt.options.vite
    )
  }

  await ctx.nuxt.callHook('vite:extend', ctx)

  if (nuxt.options.dev) {
    ctx.nuxt.hook('vite:serverCreated', (server: vite.ViteDevServer) => {
      const start = Date.now()
      warmupViteServer(server, ['/.nuxt/entry.mjs']).then(() => {
        logger.info(`Vite warmed up in ${Date.now() - start}ms`)
      }).catch(logger.error)
    })
  }

  await buildClient(ctx)
  await prepareManifests(ctx)
  await buildServer(ctx)
}

export class ViteBuilder {
  builder: any
  nuxt: Nuxt

  constructor (builder: any) {
    this.builder = builder
    this.nuxt = builder.nuxt
  }

  build () {
    return bundle(this.nuxt, this.builder)
  }
}
