import { join, resolve, normalize } from 'pathe'
import * as vite from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import viteJsxPlugin from '@vitejs/plugin-vue-jsx'
import fse from 'fs-extra'
import pDebounce from 'p-debounce'
import consola from 'consola'
import { resolveModule } from '@nuxt/kit'
import { withoutTrailingSlash } from 'ufo'
import { ViteBuildContext, ViteOptions } from './vite'
import { wpfs } from './utils/wpfs'
import { cacheDirPlugin } from './plugins/cache-dir'
import { DynamicBasePlugin } from './plugins/dynamic-base'
import { bundleRequest } from './dev-bundler'
import { writeManifest } from './manifest'
import { isCSS, isDirectory, readDirRecursively } from './utils'

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
      ssr: ctx.nuxt.options.ssr ?? true,
      rollupOptions: {
        output: {
          entryFileNames: 'server.mjs',
          preferConst: true,
          format: 'module'
        },
        external: ['#config'],
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
      DynamicBasePlugin.vite({ env: ctx.nuxt.options.dev ? 'dev' : 'server', devAppConfig: ctx.nuxt.options.app }),
      viteJsxPlugin()
    ]
  } as ViteOptions)

  await ctx.nuxt.callHook('vite:extendConfig', serverConfig, { isClient: false, isServer: true })

  ctx.nuxt.hook('nitro:generate', async () => {
    const clientDist = resolve(ctx.nuxt.options.buildDir, 'dist/client')

    // Remove public files that have been duplicated into buildAssetsDir
    // TODO: Add option to configure this behaviour in vite
    const publicDir = join(ctx.nuxt.options.srcDir, ctx.nuxt.options.dir.public)
    let publicFiles: string[] = []
    if (await isDirectory(publicDir)) {
      publicFiles = readDirRecursively(publicDir).map(r => r.replace(publicDir, ''))
      for (const file of publicFiles) {
        try {
          fse.rmSync(join(clientDist, file))
        } catch {}
      }
    }

    // Copy doubly-nested /_nuxt/_nuxt files into buildAssetsDir
    // TODO: Workaround vite issue
    if (await isDirectory(clientDist)) {
      const nestedAssetsPath = withoutTrailingSlash(join(clientDist, ctx.nuxt.options.app.buildAssetsDir))

      if (await isDirectory(nestedAssetsPath)) {
        await fse.copy(nestedAssetsPath, clientDist, { recursive: true })
        await fse.remove(nestedAssetsPath)
      }
    }
  })

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

  // Invalidate virtual modules when templates are re-generated
  ctx.nuxt.hook('app:templatesGenerated', () => {
    for (const [id, mod] of viteServer.moduleGraph.idToModuleMap) {
      if (id.startsWith('\x00virtual:')) {
        viteServer.moduleGraph.invalidateModule(mod)
      }
    }
  })

  // Close server on exit
  ctx.nuxt.hook('close', () => viteServer.close())

  // Initialize plugins
  await viteServer.pluginContainer.buildStart({})

  // Build and watch
  const _doBuild = async () => {
    const start = Date.now()
    const { code, ids } = await bundleRequest({ viteServer }, resolve(ctx.nuxt.options.appDir, 'entry'))
    await fse.writeFile(resolve(ctx.nuxt.options.buildDir, 'dist/server/server.mjs'), code, 'utf-8')
    // Have CSS in the manifest to prevent FOUC on dev SSR
    await writeManifest(ctx, ids.filter(isCSS).map(i => i.slice(1)))
    const time = (Date.now() - start)
    consola.success(`Vite server built in ${time}ms`)
    await onBuild()
  }
  const doBuild = pDebounce(_doBuild, 100)

  // Initial build
  await _doBuild()

  // Watch
  viteServer.watcher.on('all', (_event, file) => {
    file = normalize(file) // Fix windows paths
    if (file.indexOf(ctx.nuxt.options.buildDir) === 0) { return }
    doBuild()
  })
  // ctx.nuxt.hook('builder:watch', () => doBuild())
  ctx.nuxt.hook('app:templatesGenerated', () => doBuild())
}
