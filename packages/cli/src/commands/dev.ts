import chokidar from 'chokidar'
import debounce from 'debounce-promise'
import { createServer } from '../utils/server'

export async function invoke (args) {
  const server = createServer()
  const listenPromise = server.listen({ clipboard: true })

  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')

  const watcher = chokidar.watch([], { ignoreInitial: true })

  let nuxt
  const load = async () => {
    if (nuxt) { await nuxt.close() }
    nuxt = await loadNuxt({ rootDir: args._[0], dev: true })
    watcher.add(nuxt.options.watch)
    server.setApp(nuxt.server.app)
    await buildNuxt(nuxt)
  }

  watcher.on('all', debounce(load, 250))

  await load()

  await listenPromise
}

export const meta = {
  usage: 'nu dev [rootDir]',
  description: 'Run nuxt development server'
}
