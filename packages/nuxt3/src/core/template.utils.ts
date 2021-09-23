import { basename, extname } from 'upath'
import hash from 'hash-sum'
import { camelCase } from 'scule'

export type ImportMagicCommentsOptions = {
  chunkName:string
  prefetch?: boolean | number
  preload?: boolean | number
}

export const createImportMagicComments = (options: ImportMagicCommentsOptions) => {
  const { chunkName, prefetch, preload } = options
  return [
    `webpackChunkName: "${chunkName}"`,
    prefetch === true || typeof prefetch === 'number' ? `webpackPrefetch: ${prefetch}` : false,
    preload === true || typeof preload === 'number' ? `webpackPreload: ${preload}` : false
  ].filter(Boolean).join(', ')
}

export const serialize = data => JSON.stringify(data, null, 2).replace(/"{(.+)}"/g, '$1')

export const importName = (src: string) => `${camelCase(basename(src, extname(src))).replace(/[^a-zA-Z?\d\s:]/g, '')}_${hash(src)}`

export const importSources = (sources: string | string[], { lazy = false } = {}) => {
  if (!Array.isArray(sources)) {
    sources = [sources]
  }
  return sources.map((src) => {
    if (lazy) {
      return `const ${importName(src)} = () => import('${src}' /* webpackChunkName: '${src}' */)`
    }
    return `import ${importName(src)} from '${src}'`
  }).join('\n')
}
