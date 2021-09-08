import { promises as fsp } from 'fs'
import type { Plugin } from 'rollup'
import createEtag from 'etag'
import mime from 'mime'
import { resolve } from 'upath'
import globby from 'globby'
import virtual from './virtual'

export interface AssetOptions {
  inline: Boolean
  dirs: {
    [assetdir: string]: {
      dir: string
      meta?: boolean
    }
  }
}

interface Asset {
  fsPath: string,
  meta: {
    type?: string,
    etag?: string,
    mtime?: string
  }
}

export function assets (opts: AssetOptions): Plugin {
  if (!opts.inline) {
    // Development: Use filesystem
    return virtual({ '#assets': getAssetsDev(opts.dirs) })
  }

  // Production: Bundle assets
  return virtual({
    '#assets': {
      async load () {
        // Scan all assets
        const assets: Record<string, Asset> = {}
        for (const assetdir in opts.dirs) {
          const dirOpts = opts.dirs[assetdir]
          const files = globby.sync('**/*.*', { cwd: dirOpts.dir, absolute: false })
          for (const _id of files) {
            const fsPath = resolve(dirOpts.dir, _id)
            const id = assetdir + '/' + _id
            assets[id] = { fsPath, meta: {} }
            if (dirOpts.meta) {
              // @ts-ignore TODO: Use mime@2 types
              let type = mime.getType(id) || 'text/plain'
              if (type.startsWith('text')) { type += '; charset=utf-8' }
              const etag = createEtag(await fsp.readFile(fsPath))
              const mtime = await fsp.stat(fsPath).then(s => s.mtime.toJSON())
              assets[id].meta = { type, etag, mtime }
            }
          }
        }
        return getAssetProd(assets)
      }
    }
  })
}

function getAssetsDev (dirs) {
  return `
  import mime from 'mime'
  import { createStorage } from 'unstorage'
  import fsDriver from 'unstorage/drivers/fs'

  const dirs = ${JSON.stringify(dirs)}

  const storage = createStorage()

  for (const [dirname, dirOpts] of Object.entries(dirs)) {
    storage.mount(dirname, fsDriver({ base: dirOpts.dir }))
  }

  export function getKeys() {
    return storage.getKeys()
  }

  export function getAsset (id) {
    return storage.getItem(id)
  }

  export function statAsset (id) {
    return storage.getMeta(id)
  }
  `
}

function normalizeKey (key) {
  return key.replace(/[/\\\\]/g, ':').replace(/^:|:$/g, '')
}

function getAssetProd (assets: Record<string, Asset>) {
  return `
const assets = {\n${Object.entries(assets).map(([id, asset]) =>
  `  ['${normalizeKey(id)}']: {\n    import: () => import('${asset.fsPath}').then(r => r.default || r),\n    meta: ${JSON.stringify(asset.meta)}\n  }`
).join(',\n')}\n}

${normalizeKey.toString()}

export function getKeys() {
  return Object.keys(assets)
}

export function getAsset (id) {
  id = normalizeKey(id)
  return assets[id] ? assets[id].import() : null
}

export function statAsset (id) {
  id = normalizeKey(id)
  return assets[id] ? assets[id].meta : null
}
`
}
