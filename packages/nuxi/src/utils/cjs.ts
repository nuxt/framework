import { createRequire } from 'module'
import { pathToFileURL } from 'url'
import { normalize, dirname } from 'pathe'
import { interopDefault } from 'mlly'

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
  return interopDefault(_require(resolveModule(id, paths)))
}

export function importModule (id: string, paths?: string | string[]) {
  const resolvedPath = resolveModule(id, paths)
  return import(pathToFileURL(resolvedPath).href).then(interopDefault)
}

export function getNearestPackage (id: string, paths?: string | string[]) {
  while (dirname(id) !== id) {
    try { return requireModule(id + '/package.json', paths) } catch { }
    id = dirname(id)
  }
  return null
}
