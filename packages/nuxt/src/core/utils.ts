import { basename, extname } from 'pathe'
import { kebabCase, pascalCase, snakeCase } from 'scule'

export function getNameFromPath (path: string) {
  return kebabCase(basename(path).replace(extname(path), '')).replace(/["']/g, '')
}

export function getNameFromPathLocal (path: string, src: string) {
  const sourcePath = path
    .replace(src + '/', '')
    .split('/')
    .slice(0, -1)
    .map(e => snakeCase(e))
    .join('/')
  return (
    sourcePath +
    (sourcePath ? '/' : '') +
    kebabCase(basename(path).replace(extname(path), '')).replace(/["']/g, '')
  )
}

export function uniqueBy <T, K extends keyof T> (arr: T[], key: K) {
  const res: T[] = []
  const seen = new Set<T[K]>()
  for (const item of arr) {
    if (seen.has(item[key])) { continue }
    seen.add(item[key])
    res.push(item)
  }
  return res
}

export function hasSuffix (path: string, suffix: string) {
  return basename(path).replace(extname(path), '').endsWith(suffix)
}

export function getImportName (name: string) {
  return pascalCase(name).replace(/[^\w]/g, r => '_' + r.charCodeAt(0))
}
