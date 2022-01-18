import { IncomingMessage } from 'http'
import type { Plugin } from 'vite'
import { ViteNodeServer } from 'vite-node/server'
import fse from 'fs-extra'
import { resolve } from 'pathe'
import { ViteBuildContext } from '../index'
import { distDir } from '../dirs'

export function viteNodeServer (ctx: ViteBuildContext): Plugin {
  return {
    name: 'nuxt:vite-node-server',
    enforce: 'pre',
    configureServer (server) {
      let node: ViteNodeServer | undefined
      server.middlewares.use('/__nuxt_vite_node__', async (req, res, next) => {
        if (!node && ctx.ssrServer) {
          // @ts-expect-error TODO: remove when Vite is upgraded
          node = new ViteNodeServer(ctx.ssrServer)
        }
        if (!node) {
          return next()
        }

        const body = await getBodyJson(req) || {}
        const { id } = body
        if (!id) {
          res.statusCode = 400
          res.end()
        } else {
          res.write(JSON.stringify(await node.fetchModule(id)))
          res.end()
        }
      })
    }
  }
}

export async function prepareDevServerEntry (ctx: ViteBuildContext) {
  const entryPath = resolve(ctx.nuxt.options.appDir, 'entry')
  const raw = await fse.readFile(resolve(distDir, 'runtime/server.mjs'), 'utf-8')
  const code = raw
    .replace('__NUXT_SERVER_ENTRY__', entryPath)
    // TODO: read host and port from server
    .replace('__NUXT_SERVER_URL__', 'http://localhost:3000/__nuxt_vite_node__/')
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
