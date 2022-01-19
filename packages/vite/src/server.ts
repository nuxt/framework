import { resolve } from 'pathe'
import * as vite from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import viteJsxPlugin from '@vitejs/plugin-vue-jsx'
import consola from 'consola'
import { resolveModule } from '@nuxt/kit'
import { ViteBuildContext, ViteOptions } from './vite'
import { wpfs } from './utils/wpfs'
import { cacheDirPlugin } from './plugins/cache-dir'
import { prepareDevServerEntry } from './plugins/vite-node-server'

export async function buildServer (ctx: ViteBuildContext) {
  const _resolve = id => resolveModule(id, { paths: ctx.nuxt.options.modulesDir })
  const serverConfig: vite.InlineConfig = vite.mergeConfig(ctx.config, {
    define: {
      'process.server': true,
      'process.client': false,
      'typeof window': '"undefined"',
      'typeof document': '"undefined"',
      'typeof navigator': '"undefined"',
      'typeof location': '"undefined"',
      'typeof XMLHttpRequest': '"undefined"'
    },
    resolve: {
      alias: {
        '#build/plugins': resolve(ctx.nuxt.options.buildDir, 'plugins/server'),
        // Alias vue
        'vue/server-renderer': _resolve('vue/server-renderer'),
        'vue/compiler-sfc': _resolve('vue/compiler-sfc'),
        '@vue/reactivity': _resolve(`@vue/reactivity/dist/reactivity.cjs${ctx.nuxt.options.dev ? '' : '.prod'}.js`),
        '@vue/shared': _resolve(`@vue/shared/dist/shared.cjs${ctx.nuxt.options.dev ? '' : '.prod'}.js`),
        'vue-router': _resolve(`vue-router/dist/vue-router.cjs${ctx.nuxt.options.dev ? '' : '.prod'}.js`),
        vue: _resolve(`vue/dist/vue.cjs${ctx.nuxt.options.dev ? '' : '.prod'}.js`)
      }
    },
    ssr: {
      external: [],
      noExternal: [
        ...ctx.nuxt.options.build.transpile,
        // TODO: Use externality for production (rollup) build
        /\/esm\/.*\.js$/,
        /\.(es|esm|esm-browser|esm-bundler).js$/,
        '/__vue-jsx',
        '#app',
        /nuxt3\/dist/,
        /nuxt3\/src/,
        /@nuxt\/nitro\/dist/,
        /@nuxt\/nitro\/src/
      ]
    },
    build: {
      outDir: resolve(ctx.nuxt.options.buildDir, 'dist/server'),
      ssr: true,
      rollupOptions: {
        output: {
          entryFileNames: 'server.mjs',
          preferConst: true,
          format: 'module'
        },
        onwarn (warning, rollupWarn) {
          if (!['UNUSED_EXTERNAL_IMPORT'].includes(warning.code)) {
            rollupWarn(warning)
          }
        }
      }
    },
    server: {
      // https://github.com/vitest-dev/vitest/issues/229#issuecomment-1002685027
      preTransformRequests: false
    },
    plugins: [
      cacheDirPlugin(ctx.nuxt.options.rootDir, 'server'),
      vuePlugin(ctx.config.vue),
      viteJsxPlugin()
    ]
  } as ViteOptions)

  await ctx.nuxt.callHook('vite:extendConfig', serverConfig, { isClient: false, isServer: true })

  const onBuild = () => ctx.nuxt.callHook('build:resources', wpfs)

  // Production build
  if (!ctx.nuxt.options.dev) {
    const start = Date.now()
    consola.info('Building server...')
    await vite.build(serverConfig)
    await onBuild()
    consola.success(`Server built in ${Date.now() - start}ms`)
    return
  }

  if (!ctx.nuxt.options.ssr) {
    await onBuild()
    return
  }

  // Start development server
  const viteServer = await vite.createServer(serverConfig)
  ctx.ssrServer = viteServer

  // Close server on exit
  ctx.nuxt.hook('close', () => viteServer.close())

  // Initialize plugins
  await viteServer.pluginContainer.buildStart({})

  await prepareDevServerEntry(ctx)
}
