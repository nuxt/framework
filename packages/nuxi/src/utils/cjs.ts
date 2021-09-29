import { createRequire } from 'module'
import { normalize, dirname } from 'pathe'

export function getModulePaths (paths?: string | string[]): string[] {
  return [].concat(
    // @ts-ignore
    global.__NUXT_PREPATHS__,
    ...(Array.isArray(paths) ? paths : [paths]),
    process.cwd(),
    // @ts-ignore
    global.__NUXT_PATHS__
  ).filter(Boolean)
}

const _require = createRequire(process.cwd())

export function resolveModule (id: string, paths?: string | string[]) {
  return normalize(_require.resolve(id, { paths: getModulePaths(paths) }))
}

export function tryResolveModule (id: string, paths?: string | string[]) {
  try {
    return resolveModule(id, paths)
  } catch { return null }
}

export function requireModule (id: string, paths?: string | string[]) {
  return _require(resolveModule(id, paths))
}

export function importModule (id: string, paths?: string | string[]) {
  return import(resolveModule(id, paths))
}

export function getNearestPackage (id: string, paths?: string | string[]) {
  while (dirname(id) !== id) {
    try { return requireModule(id + '/package.json', paths) } catch { }
    id = dirname(id)
  }
  return null
}
