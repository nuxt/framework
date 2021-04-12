import { readFile, stat } from 'fs/promises'
import type { Plugin } from 'rollup'
import createEtag from 'etag'
import mime from 'mime'
import { resolve } from 'upath'
import globby from 'globby'
import virtual from './virtual'

export interface AssetOptions {
  dirs: {
    [groupname: string]: {
      dir: string
      meta?: boolean
    }
  }
}

export function assets (opts: AssetOptions): Plugin {
  type Asset = {
    fsPath: string,
    meta: {
      type?: string,
      etag?: string,
      mtime?: string
    }
  }
  return virtual({
    '~nitro/assets': {
      async load () {
        const assets: Record<string, Record<string, Asset>> = {}
        for (const groupname in opts.dirs) {
          const dirOpts = opts.dirs[groupname]
          const files = globby.sync('**/*.*', { cwd: dirOpts.dir, absolute: false })
          assets[groupname] = {}
          for (const id of files) {
            const fsPath = resolve(dirOpts.dir, id)
            assets[groupname][id] = { fsPath, meta: {} }
            if (dirOpts.meta) {
              let type = mime.getType(id) || 'text/plain'
              if (type.startsWith('text')) { type += '; charset=utf-8' }
              const etag = createEtag(await readFile(fsPath))
              const mtime = await stat(fsPath).then(s => s.mtime.toJSON())
              assets[groupname][id].meta = { type, etag, mtime }
            }
          }
        }
        return `${Object.keys(assets).map(groupname => `export const ${groupname} = {\n  ${
          Object.keys(assets[groupname]).map(id => `['${id}']: { load: () => import('${assets[groupname][id].fsPath}'), meta: ${JSON.stringify(assets[groupname][id].meta)} }`).join(',\n  ')}\n}`
        ).join('\n\n')}`
      }
    }
  })
}
