import fs from 'fs-extra'
import { Nuxt } from '@nuxt/kit'
import { resolve, extname } from 'upath'
import type { Plugin } from 'vite'

/**
 * Rewrite hashed assets in SSR back to their original file.
 *
 * For example:
 * '/_nuxt/assets/logo.21aaaacb.svg' -> '/assets/logo.svg'
 */
export function ssrAssetsServe (nuxt: Nuxt) {
  return <Plugin>{
    name: 'nuxt:assets-serve',
    enforce: 'pre',
    configureServer (server) {
      const ssrManifestPath = resolve(nuxt.options.buildDir, 'dist/server/ssr-manifest.json')
      let assetMap: Record<string, string>

      async function readManifest () {
        assetMap = {}
        if (!fs.existsSync(ssrManifestPath)) {
          return
        }
        const ssrManifest: Record<string, string[]> = await fs.readJSON(ssrManifestPath)
        Object.entries(ssrManifest).forEach(([key, value]) => {
          value.forEach((path) => {
            if (extname(path) === extname(key)) {
              assetMap[path] = '/' + key
            }
          })
        })
      }

      server.watcher.add(ssrManifestPath)
      server.watcher.on('change', (path) => {
        if (path === ssrManifestPath) {
          readManifest()
        }
      })
      server.middlewares.use((req, _, next) => {
        if (assetMap[req.url]) {
          req.url = assetMap[req.url]
        }
        next()
      })
      readManifest()
    }
  }
}
