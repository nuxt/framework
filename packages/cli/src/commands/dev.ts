import { resolve } from 'path'
import chokidar from 'chokidar'
import debounce from 'debounce-promise'
import { createServer, createLoadingHandler, createDynamicFunction } from '../utils/server'
import { requireModule } from '../utils/cjs'
import { error, info } from '../utils/log'
import { diff, printDiff } from '../utils/diff'
import { showBanner } from '../utils/banner'

export async function invoke (args) {
  // Set NODE_ENV
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'

  // Start development server
  const server = createServer()
  const listener = await server.listen({ clipboard: args.clipboard, open: args.open || args.o })

  // Resolve actual rootDir
  const rootDir = resolve(args._[0] || '.')

  // Add devtools
  // TODO: Check if installed
  const { createDevtoolsService } = requireModule('@nuxt/devtools', rootDir)
  const devtools = createDevtoolsService()
  server.app.use('/_devtools', devtools.app)

  // Nuxt middleware
  const nuxtMiddleware = createDynamicFunction(createLoadingHandler('Initializing nuxt...', 1))
  server.app.use(nuxtMiddleware.call)

  let currentNuxt
  const load = async () => {
    try {
      showBanner(true)
      listener.showURL()

      const { loadNuxt, buildNuxt } = requireModule('@nuxt/kit', rootDir)
      const newNuxt = await loadNuxt({ rootDir, dev: true, ready: false })
      devtools.setNuxt(newNuxt)

      if (process.env.DEBUG) {
        let configChanges
        if (currentNuxt) {
          configChanges = diff(currentNuxt.options, newNuxt.options, [
            'generate.staticAssets.version',
            'env.NITRO_PRESET'
          ])
          nuxtMiddleware.set(createLoadingHandler('Restarting nuxt...', 1))
          await currentNuxt.close()
          currentNuxt = newNuxt
        } else {
          currentNuxt = newNuxt
        }

        if (configChanges) {
          if (configChanges.length) {
            info('Nuxt config updated:')
            printDiff(configChanges)
          } else {
            info('Restarted nuxt due to config changes')
          }
        }
      } else {
        currentNuxt = newNuxt
      }

      await currentNuxt.ready()
      await buildNuxt(currentNuxt)
      nuxtMiddleware.set(currentNuxt.server.app)
    } catch (err) {
      error('Cannot load nuxt.', err)
      nuxtMiddleware.set(createLoadingHandler(
        'Error while loading nuxt. Please check console and fix errors.'
      ))
    }
  }

  // Watch for config changes
  // TODO: Watcher service, modules, and requireTree
  const dLoad = debounce(load, 250)
  const watcher = chokidar.watch([rootDir], { ignoreInitial: true, depth: 1 })
  watcher.on('all', (_event, file) => {
    if (file.includes('nuxt.config') || file.includes('modules')) {
      dLoad()
    }
  })

  await load()
}

export const meta = {
  usage: 'nu dev [rootDir] [--clipboard] [--open, -o]',
  description: 'Run nuxt development server'
}
