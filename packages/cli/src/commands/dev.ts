import { resolve } from 'path'
import chokidar from 'chokidar'
import debounce from 'debounce-promise'
import { createServer, createLoadingHandler } from '../utils/server'
import { showBanner } from '../utils/banner'

export async function invoke (args) {
  const server = createServer()
  const listener = await server.listen({ clipboard: true, open: true })

  const rootDir = resolve(args._[0] || '.')

  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')

  const watcherFiles = new Set<String>()
  const watcher = chokidar.watch([rootDir], { ignoreInitial: true, depth: 0 })

  let nuxt
  const load = async () => {
    try {
      if (nuxt) {
        await nuxt.close()
        showBanner(true)
        listener.showURL()
      }
      nuxt = await loadNuxt({ rootDir, dev: true })
      watcherFiles.add(nuxt.options.watch)
      await buildNuxt(nuxt)
      server.setApp(nuxt.server.app)
    } catch (err) {
      console.error('Error while loading nuxt: ', err)
      server.setApp(createLoadingHandler(
        'Error while loading nuxt. Please check console and fix error.'
      ))
    }
  }

  const dLoad = debounce(load, 250)
  watcher.on('all', (_event, file) => {
    if (watcherFiles.has(file) || file.includes('nuxt.config')) {
      dLoad()
    }
  })

  await load()
}

export const meta = {
  usage: 'nu dev [rootDir]',
  description: 'Run nuxt development server'
}
