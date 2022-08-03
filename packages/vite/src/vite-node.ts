import { pathToFileURL } from 'node:url'
import { createApp, createError, defineEventHandler, defineLazyEventHandler } from 'h3'
import { ViteNodeServer } from 'vite-node/server'
import fse from 'fs-extra'
import { resolve } from 'pathe'
import { addServerMiddleware } from '@nuxt/kit'
import type { Plugin as VitePlugin, ViteDevServer } from 'vite'
import type { Manifest } from 'vue-bundle-renderer'
import { resolve as resolveModule } from 'mlly'
import { distDir } from './dirs'
import type { ViteBuildContext } from './vite'
import { isCSS } from './utils'
import { createIsExternal } from './utils/external'

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
    route: '/__nuxt_vite_node__/',
    handler: createViteNodeMiddleware(ctx)
  })
}

function getManifest (server: ViteDevServer) {
  const css = Array.from(server.moduleGraph.urlToModuleMap.keys())
    .filter(i => isCSS(i))

  const manifest: Manifest = {
    '@vite/client': {
      file: '@vite/client',
      css,
      assets: [],
      dynamicImports: [],
      isEntry: true,
      module: true,
      resourceType: 'script'
    },
    'entry.mjs': {
      file: 'entry.mjs',
      isEntry: true,
      module: true,
      resourceType: 'script'
    }
  }

  return manifest
}

function createViteNodeMiddleware (ctx: ViteBuildContext) {
  const app = createApp()

  app.use('/manifest', defineEventHandler(() => {
    const manifest = getManifest(ctx.ssrServer)
    return manifest
  }))

  app.use('/module', defineLazyEventHandler(() => {
    const viteServer = ctx.ssrServer
    const node: ViteNodeServer = new ViteNodeServer(viteServer, {
      deps: {
        inline: [
          /\/(nuxt|nuxt3)\//,
          /^#/,
          ...ctx.nuxt.options.build.transpile as string[]
        ]
      },
      transformMode: {
        ssr: [/.*/],
        web: []
      }
    })
    const isExternal = createIsExternal(viteServer, ctx.nuxt.options.rootDir)
    node.shouldExternalize = async (id: string) => {
      const result = await isExternal(id)
      if (result?.external) {
        return resolveModule(result.id, { url: ctx.nuxt.options.rootDir })
      }
      return false
    }

    return async (event) => {
      const moduleId = decodeURI(event.req.url).substring(1)
      if (moduleId === '/') {
        throw createError({ statusCode: 400 })
      }
      const module = await node.fetchModule(moduleId) as any
      return module
    }
  }))

  return app.nodeHandler
}

export async function initViteNodeServer (ctx: ViteBuildContext) {
  let entryPath = resolve(ctx.nuxt.options.appDir, 'entry.async.mjs')
  if (!fse.existsSync(entryPath)) {
    entryPath = resolve(ctx.nuxt.options.appDir, 'entry.async')
  }

  // TODO: Update me
  const host = ctx.nuxt.options.server.host || 'localhost'
  const port = ctx.nuxt.options.server.port || '3000'
  const protocol = ctx.nuxt.options.server.https ? 'https' : 'http'

  // Serialize and pass vite-node runtime options
  const viteNodeServerOptions = {
    baseURL: `${protocol}://${host}:${port}/__nuxt_vite_node__`,
    rootDir: ctx.nuxt.options.rootDir,
    entryPath,
    base: ctx.ssrServer.config.base || '/_nuxt/'
  }
  process.env.NUXT_VITE_NODE_OPTIONS = JSON.stringify(viteNodeServerOptions)

  const serverResolvedPath = resolve(distDir, 'runtime/vite-node.mjs')
  const manifestResolvedPath = resolve(distDir, 'runtime/client.manifest.mjs')

  await fse.writeFile(
    resolve(ctx.nuxt.options.buildDir, 'dist/server/server.mjs'),
    `export { default } from ${JSON.stringify(pathToFileURL(serverResolvedPath).href)}`
  )
  await fse.writeFile(
    resolve(ctx.nuxt.options.buildDir, 'dist/server/client.manifest.mjs'),
    `export { default } from ${JSON.stringify(pathToFileURL(manifestResolvedPath).href)}`
  )
}
