import { promises as fsp, existsSync } from 'fs'
import { basename, dirname, resolve, join, normalize, isAbsolute } from 'pathe'
import { globby } from 'globby'
import { useNuxt } from './context'
import { tryResolveModule } from '.'

/**
 * Resolve full path to a file or directory respecting Nuxt alias and extensions options
 *
 * Relative paths are resolved to the rootDir
 * If path could not be resolved, normalized input path will be returned
 *
 * @param path Unresolved path to a file or directory
 * @returns {Promise<string>} Normalized resolved path
 */
export async function resolvePath (path: string): Promise<string> {
  // Always normalize input
  path = normalize(path)

  // Fast return if the path exists
  if (await existsSensitive(path)) {
    return path
  }

  // Use current nuxt options
  const nuxt = useNuxt()

  // Resolve aliases
  path = resolveAlias(path)

  // Resolve relative to rootDir
  if (!isAbsolute(path)) {
    path = resolve(nuxt.options.rootDir, path)
  }

  // Check if resolvedPath is a file
  let isDirectory = false
  if (await existsSync(path)) {
    isDirectory = (await fsp.lstat(path)).isDirectory()
    if (!isDirectory) {
      return path
    }
  }

  // Check possible extensions
  for (const ext of nuxt.options.extensions) {
    // path.[ext]
    const pathWithExt = path + ext
    if (!isDirectory && existsSync(pathWithExt)) {
      return pathWithExt
    }
    // path/index.[ext]
    const pathWithIndex = join(path, 'index' + ext)
    if (isDirectory && existsSync(pathWithIndex)) {
      return pathWithIndex
    }
  }

  // Try to resolve as module id
  const resolveModulePath = tryResolveModule(path, { paths: nuxt.options.modulesDir })
  if (resolveModulePath) {
    return resolveModulePath
  }

  // Return normalized input
  return path
}

/**
 * Try to resolve first existing file in paths
 *
 * @param paths Possible search paths
 */
export async function findPath (paths: string[]): Promise<string|null> {
  for (const path of paths) {
    const rPath = await resolvePath(path)
    if (await existsSensitive(rPath)) {
      return rPath
    }
  }
  return null
}

/**
 * Resolve path aliases respecting Nuxt alias options
 *
 * @param path Input path
 */
export function resolveAlias (path: string): string {
  const nuxt = useNuxt()
  const alias = nuxt.options.alias
  for (const key in alias) {
    if (key === '@' && !path.startsWith('@/')) { continue } // Don't resolve @foo/bar
    if (path.startsWith(key)) {
      path = alias[key] + path.slice(key.length)
    }
  }
  return path
}

// --- Internal ---

async function existsSensitive (path: string) {
  if (!existsSync(path)) { return false }
  const dirFiles = await fsp.readdir(dirname(path))
  return dirFiles.includes(basename(path))
}

export async function resolveFiles (path: string, pattern: string | string[]) {
  const files = await globby(pattern, {
    cwd: path,
    followSymbolicLinks: true
  })
  return files.map(p => resolve(path, p))
}
