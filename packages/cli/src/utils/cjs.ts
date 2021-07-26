import { normalize, dirname } from 'upath'

export function getModulePaths (paths?) {
  return [].concat(
    // @ts-ignore
    global.__NUXT_PREPATHS__,
    paths,
    process.cwd(),
    // @ts-ignore
    global.__NUXT_PATHS__
  ).filter(Boolean)
}

export function resolveModule (id: string, paths?: string) {
  return normalize(require.resolve(id, { paths: getModulePaths(paths) }))
}

export function tryResolveModule (id: string, paths?: string) {
  try {
    return resolveModule(id, paths)
  } catch { return null }
}

export function requireModule (id: string, paths?: string) {
  return require(resolveModule(id, paths))
}

export function getNearestPackage (id: string, paths?: string) {
  while (dirname(id) !== id) {
    try { return requireModule(id + '/package.json', paths) } catch { }
    id = dirname(id)
  }
  return null
}
