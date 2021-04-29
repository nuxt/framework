import { resolve } from 'path'
import consola from 'consola'
import chokidar from 'chokidar'
import debounce from 'debounce-promise'
import ora from 'ora'
import t from '@nuxt/translations'
import { createServer, createLoadingHandler } from '../utils/server'
import { requireModule } from '../utils/cjs'
import { error, info } from '../utils/log'
import { diff, printDiff } from '../utils/diff'

export async function invoke (args) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'
  let start = Date.now()
  const server = createServer()
  await server.listen({
    showURL: true,
    clipboard: args.clipboard,
    open: args.open || args.o
  })

  const rootDir = resolve(args._[0] || '.')

  const { loadNuxt, buildNuxt } = requireModule('@nuxt/kit', rootDir)

  let currentNuxt
  const load = async (reloading: boolean = false) => {
    let spinner
    if (process.env.DEBUG) {
      consola.info(reloading ? t.cli.reloading : t.cli.loading)
    } else {
      spinner = ora(reloading ? t.cli.reloading : t.cli.loading).start()
    }
    if (reloading) { start = Date.now() }
    try {
      const newNuxt = await loadNuxt({ rootDir, dev: true, ready: false })

      if (process.env.DEBUG) {
        let configChanges
        if (currentNuxt) {
          configChanges = diff(currentNuxt.options, newNuxt.options, [
            'generate.staticAssets.version',
            'env.NITRO_PRESET'
          ])
          server.setApp(createLoadingHandler('Restarting...', 1))
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
      server.setApp(currentNuxt.server.app)
      spinner?.stop()
      consola.success(t.cli.ready(Date.now() - start))
    } catch (err) {
      error('Cannot load Nuxt', err)
      server.setApp(createLoadingHandler(t.cli.loadError))
    }
  }

  // Watch for config changes
  // TODO: Watcher service, modules, and requireTree
  const reload = debounce(() => load(true), 250)
  const watcher = chokidar.watch([rootDir], { ignoreInitial: true, depth: 1 })
  watcher.on('all', (_event, file) => {
    if (file.includes('nuxt.config') || file.includes('modules')) {
      reload()
    }
  })

  await load()
}

export const meta = {
  usage: 'nu dev [rootDir] [--clipboard] [--open, -o]',
  description: 'Run nuxt development server'
}
