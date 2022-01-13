import { readFileSync, statSync } from 'fs'
import createEtag from 'etag'
import mime from 'mime'
import { relative, resolve } from 'pathe'
import virtual from '@rollup/plugin-virtual'
import { globbySync } from 'globby'
import type { Plugin } from 'rollup'
import type { NitroContext } from '../../context'

export function staticAssets (context: NitroContext) {
  const assets: Record<string, { type: string, etag: string, mtime: string, path: string }> = {}

  const files = globbySync('**/*.*', { cwd: context.output.publicDir, absolute: false })

  for (const id of files) {
    let type = mime.getType(id) || 'text/plain'
    if (type.startsWith('text')) { type += '; charset=utf-8' }
    const fullPath = resolve(context.output.publicDir, id)
    const etag = createEtag(readFileSync(fullPath))
    const stat = statSync(fullPath)

    assets['/' + id] = {
      type,
      etag,
      mtime: stat.mtime.toJSON(),
      path: relative(context.output.serverDir, fullPath)
    }
  }

  return virtual({
    '#static-assets': `export default ${JSON.stringify(assets, null, 2)};`,
    '#static': `
import { promises } from 'fs'
import { resolve } from 'pathe'
import { dirname } from 'pathe'
import { fileURLToPath } from 'url'
import assets from '#static-assets'

const mainDir = dirname(fileURLToPath(globalThis.entryURL))

export function readAsset (id) {
  return promises.readFile(resolve(mainDir, getAsset(id).path))
}

export function getAsset (id) {
  return assets[id]
}
`
  })
}

export function dirnames (): Plugin {
  return {
    name: 'dirnames',
    renderChunk (code, chunk) {
      return {
        code: (chunk.isEntry ? 'globalThis.entryURL = import.meta.url;' : '') + code,
        map: null
      }
    }
  }
}
