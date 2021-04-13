import { createServer } from '../utils/server'

export async function invoke (args) {
  const server = createServer()
  const listenPromise = server.listen({ clipboard: true })

  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')

  const nuxt = await loadNuxt({
    rootDir: args._[0],
    dev: true
  })

  server.setApp(nuxt.server.app)

  await buildNuxt(nuxt)

  await listenPromise
}

export const meta = {
  usage: 'nu dev [rootDir]',
  description: 'Run nuxt development server'
}
