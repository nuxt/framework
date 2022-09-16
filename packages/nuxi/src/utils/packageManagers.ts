import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import destr from 'destr'
import { resolve } from 'pathe'
import { findup } from './fs'

export const packageManagerLocks = {
  yarn: 'yarn.lock',
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml'
}

type PackageManager = keyof typeof packageManagerLocks

export function getPackageManager (rootDir: string) {
  return findup(rootDir, (dir) => {
    for (const name in packageManagerLocks) {
      const path = packageManagerLocks[name as PackageManager]
      if (path && existsSync(resolve(dir, path))) {
        return name
      }
    }
  }) as PackageManager | null
}

export function getPackageManagerVersion (name: string) {
  return execSync(`${name} --version`).toString('utf8').trim()
}

/**
 * Find package.json and read it
 *
 * @example
 * ```ts
 * findPackage('nuxt', '/path/to/project')
 * ```
 * @param name - package name
 * @param rootDir - root directory
 */
export function getPkg (name: string, rootDir: string) {
  // Assume it is in {rootDir}/node_modules/${name}/package.json
  let pkgPath = resolve(rootDir, 'node_modules', name, 'package.json')

  // Try to resolve for more accuracy
  const _require = createRequire(rootDir)
  try { pkgPath = _require.resolve(name + '/package.json') } catch (_err) {
    // console.log('not found:', name)
  }

  return readJSONSync(pkgPath)
}

/**
 * findPackage - Read package.json file
 *
 * @param rootDir - file path
 */
export function findPackage (rootDir: string) {
  return findup(rootDir, (dir) => {
    const p = resolve(dir, 'package.json')
    if (existsSync(p)) {
      return readJSONSync(p)
    }
  }) || {}
}

export function readJSONSync (filePath: string) {
  try {
    return destr(readFileSync(filePath, 'utf-8'))
  } catch (err) {
    // TODO: Warn error
    return null
  }
}
