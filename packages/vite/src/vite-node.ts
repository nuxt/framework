import { IncomingMessage } from 'http'
import { ViteNodeServer } from 'vite-node/server'
import fse from 'fs-extra'
import { resolve } from 'pathe'
import { addServerMiddleware } from '@nuxt/kit'
import { distDir } from './dirs'
import type { ViteBuildContext } from './vite'

export function registerViteNodeMiddleware (ctx: ViteBuildContext) {
  let viteNode: ViteNodeServer | undefined
  addServerMiddleware({
    route: '/__nuxt_vite_node__/',
    handle: async (req, res, next) => {
      console.log('vite-node-middleware', { url: req.url })
      if (!viteNode && ctx.ssrServer) {
        viteNode = new ViteNodeServer(ctx.ssrServer, {
          deps: {
            inline: [
              ...ctx.nuxt.options.build.transpile as string[]
            ]
          }
        })
      }
      if (!viteNode) {
        return next()
      }

      const body = await getBodyJson(req) || {}
      const { id } = body
      if (!id) {
        res.statusCode = 400
        res.end()
      } else {
        console.log({ id })
        res.write(JSON.stringify(await viteNode.fetchModule(id)))
        res.end()
      }
    }
  })
}

export async function prepareDevServerEntry (ctx: ViteBuildContext) {
  const entryPath = resolve(ctx.nuxt.options.appDir, 'entry')
  const raw = await fse.readFile(resolve(distDir, 'runtime/server.mjs'), 'utf-8')
  const host = ctx.nuxt.options.server.host || 'localhost'
  const port = ctx.nuxt.options.server.port || '3000'
  const protocol = ctx.nuxt.options.server.https ? 'https' : 'http'
  const code = raw
    .replace('__NUXT_SERVER_FETCH_URL__', `${protocol}://${host}:${port}/__nuxt_vite_node__/`)
    .replace('__NUXT_SERVER_ENTRY__', entryPath)
    .replace('__NUXT_SERVER_BASE__', ctx.ssrServer.config.base || '/_nuxt/')
  await fse.writeFile(
    resolve(ctx.nuxt.options.buildDir, 'dist/server/server.mjs'),
    code,
    'utf-8'
  )
}

function getBodyJson (req: IncomingMessage) {
  return new Promise<any>((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('error', reject)
    req.on('end', () => {
      try {
        resolve(JSON.parse(body) || {})
      } catch (e) {
        reject(e)
      }
    })
  })
}
