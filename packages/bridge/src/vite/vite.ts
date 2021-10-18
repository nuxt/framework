import { resolve } from 'pathe'
import * as vite from 'vite'
import consola from 'consola'
import { buildClient } from './client'
import { buildServer } from './server'
import { defaultExportPlugin } from './plugins/default-export'
import { jsxPlugin } from './plugins/jsx'
import { replace } from './plugins/replace'
import { resolveCSSOptions } from './css'
import { warmupViteServer } from './utils/warmup'
import type { Nuxt, ViteBuildContext, ViteOptions } from './types'
import { prepareManifests } from './manifest'

async function bundle (nuxt: Nuxt, builder: any) {
  for (const p of builder.plugins) {
    p.src = nuxt.resolver.resolvePath(resolve(nuxt.options.buildDir, p.src))
  }

  const ctx: ViteBuildContext = {
    nuxt,
    builder,
    config: vite.mergeConfig(
      nuxt.options.vite || {},
      {
        root: nuxt.options.rootDir,
        mode: nuxt.options.dev ? 'development' : 'production',
        logLevel: 'warn',
        define: {
          'process.dev': nuxt.options.dev
        },
        resolve: {
          extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
          alias: {
            ...nuxt.options.alias,
            '.nuxt': nuxt.options.buildDir,
            _nuxt: nuxt.options.buildDir,
            '~': nuxt.options.srcDir,
            '@': nuxt.options.srcDir,
            'web-streams-polyfill/ponyfill/es2018': require.resolve('./runtime/mock/web-streams-polyfill.mjs'),
            'whatwg-url': require.resolve('./runtime/mock/whatwg-url.mjs'),
            // Cannot destructure property 'AbortController' of ..
            'abort-controller': require.resolve('./runtime/mock/abort-controller.mjs')
          }
        },
        vue: {},
        server: {
          fs: {
            strict: false
          }
        },
        css: resolveCSSOptions(nuxt),
        optimizeDeps: {
          exclude: [
            'ufo',
            'date-fns',
            'nanoid'
          ]
        },
        esbuild: {
          jsxFactory: 'h',
          jsxFragment: 'Fragment'
        },
        publicDir: resolve(nuxt.options.srcDir, nuxt.options.dir.static),
        clearScreen: false,
        build: {
          emptyOutDir: false
        },
        plugins: [
          replace({
            __webpack_public_path__: 'globalThis.__webpack_public_path__'
          }),
          jsxPlugin(),
          defaultExportPlugin()
        ]
      } as ViteOptions
    )
  }

  // https://github.com/nuxt-community/i18n-module/pull/1079
  const i18nAlias = ctx.config.resolve.alias['~i18n-klona']
  if (i18nAlias) {
    ctx.config.resolve.alias['~i18n-klona'] = i18nAlias.replace('.js', '.mjs')
  }
  await ctx.nuxt.callHook('vite:extend', ctx)

  if (nuxt.options.dev) {
    ctx.nuxt.hook('vite:serverCreated', (server: vite.ViteDevServer) => {
      const start = Date.now()
      warmupViteServer(server, ['/.nuxt/client.js']).then(() => {
        consola.info(`Vite warmed up in ${Date.now() - start}ms`)
      }).catch(consola.error)
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
