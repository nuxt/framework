import { existsSync, promises as fsp, readFileSync } from 'fs'
import { promisify } from 'util'
import jiti from 'jiti'
import rimraf from 'rimraf'
import { dirname, resolve } from 'pathe'
import destr from 'destr'

// Check if a file exists
export async function exists (path: string) {
  try {
    await fsp.access(path)
    return true
  } catch {
    return false
  }
}

export async function clearDir (path: string) {
  await promisify(rimraf)(path)
  await fsp.mkdir(path, { recursive: true })
}

export function findup<T> (rootDir: string, fn: (dir: string) => T | undefined): T | null {
  let dir = rootDir
  while (dir !== dirname(dir)) {
    const res = fn(dir)
    if (res) {
      return res
    }
    dir = dirname(dir)
  }
  return null
}

export function findPackage (rootDir) {
  return findup(rootDir, (dir) => {
    const p = resolve(dir, 'package.json')
    if (existsSync(p)) {
      return readJSONSync(p)
    }
  }) || {}
}

export function readJSONSync (filePath) {
  try {
    return destr(readFileSync(filePath, 'utf-8'))
  } catch (err) {
    // TODO: Warn error
    return null
  }
}

export function getNuxtConfig (rootDir) {
  try {
    return jiti(rootDir, { interopDefault: true })('./nuxt.config')
  } catch (err) {
    // TODO: Show error as warning if it is not 404
    return {}
  }
}
