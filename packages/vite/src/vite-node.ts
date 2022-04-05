import { IncomingMessage } from 'http'
import { ViteNodeServer } from 'vite-node/server'
import fse from 'fs-extra'
import { resolve } from 'pathe'
import { addServerMiddleware } from '@nuxt/kit'
import type { Connect, Plugin as VitePlugin, ViteDevServer } from 'vite'
import { distDir } from './dirs'
import type { ViteBuildContext } from './vite'
import { isCSS } from './utils'

// TODO: Remove this in favor of registerViteNodeMiddleware
// after Nitropack or h3 fixed for adding middlewares after setup
export function viteNodePlugin (ctx: ViteBuildContext): VitePlugin {
  return {
    name: 'nuxt:vite-node-server',
    enforce: 'pre',
    configureServer (server) {
      server.middlewares.use('/__nuxt_vite_node__', createViteNodeMiddleware(ctx))
    }
  }
}

export function registerViteNodeMiddleware (ctx: ViteBuildContext) {
  addServerMiddleware({
    path: '/__nuxt_vite_node__/',
    handler: createViteNodeMiddleware(ctx)
  })
}

async function getManifest (server: ViteDevServer) {
  const ids = Array.from(server.moduleGraph.urlToModuleMap.keys())
    .filter(i => isCSS(i))

  const entries = [
    '@vite/client',
    'entry.mjs',
    ...ids.map(i => i.slice(1))
  ]

  return {
    publicPath: '',
    all: entries,
    initial: entries,
    async: [],
    modules: {}
  }
}

function createViteNodeMiddleware (ctx: ViteBuildContext): Connect.NextHandleFunction {
  let node: ViteNodeServer | undefined
  return async (req, res, next) => {
    if (!node && ctx.ssrServer) {
      node = new ViteNodeServer(ctx.ssrServer, {
        deps: {
          inline: [
            /\/nuxt3\//,
            /^#/,
            ...ctx.nuxt.options.build.transpile as string[]
          ]
        }
      })
    }
    if (!node) {
      return next()
    }

    if (req.url === '/manifest') {
      res.write(JSON.stringify(await getManifest(ctx.ssrServer)))
      res.end()
      return
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
  }
}

export async function prepareDevServerEntry (ctx: ViteBuildContext) {
  let entryPath = resolve(ctx.nuxt.options.appDir, 'entry.async.mjs')
  if (!fse.existsSync(entryPath)) {
    entryPath = resolve(ctx.nuxt.options.appDir, 'entry.async')
  }

  const host = ctx.nuxt.options.server.host || 'localhost'
  const port = ctx.nuxt.options.server.port || '3000'
  const protocol = ctx.nuxt.options.server.https ? 'https' : 'http'

  process.env.NUXT_VITE_SERVER_FETCH = `${protocol}://${host}:${port}/__nuxt_vite_node__`
  process.env.NUXT_VITE_SERVER_ENTRY = entryPath
  process.env.NUXT_VITE_SERVER_BASE = ctx.ssrServer.config.base || '/_nuxt/'
  process.env.NUXT_VITE_SERVER_ROOT = ctx.nuxt.options.rootDir

  await fse.writeFile(
    resolve(ctx.nuxt.options.buildDir, 'dist/server/server.mjs'),
    `export { default } from ${JSON.stringify(resolve(distDir, 'runtime/vite-node.mjs'))}`
  )
  await fse.writeFile(
    resolve(ctx.nuxt.options.buildDir, 'dist/server/client.manifest.mjs'),
    `export { default } from ${JSON.stringify(resolve(distDir, 'runtime/client.manifest.mjs'))}`
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
