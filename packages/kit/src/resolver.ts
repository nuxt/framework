import { resolve, join } from 'path'
import fs from 'fs-extra'
import jiti from 'jiti'
import type { Nuxt } from './types'
import { isExternalDependency, clearRequireCache } from './utils/cjs'
import { startsWithRootAlias, startsWithSrcAlias } from './utils/resolve'

export interface ResolvePathOptions {
  isAlias?: boolean
  isModule?: boolean
  isStyle?: boolean
}

export interface RequireModuleOptions {
  useESM?: boolean
  isAlias?: boolean
  interopDefault?: any
}

export class Resolver {
  _require: NodeJS.Require
  _resolve: NodeJS.RequireResolve
  nuxt: Nuxt
  options: Nuxt['options']

  constructor (nuxt: Nuxt) {
    this.nuxt = nuxt
    this.options = this.nuxt.options

    // Binds
    this.resolvePath = this.resolvePath.bind(this)
    this.resolveAlias = this.resolveAlias.bind(this)
    this.resolveModule = this.resolveModule.bind(this)
    this.requireModule = this.requireModule.bind(this)

    this._require = jiti(__filename)
    this._resolve = this._require.resolve
  }

  resolveModule (path: string) {
    try {
      return this._resolve(path, {
        paths: this.options.modulesDir
      })
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        // TODO: remove after https://github.com/facebook/jest/pull/8487 released
        if (process.env.NODE_ENV === 'test' && error.message.startsWith('Cannot resolve module')) {
          return
        }
        throw error
      }
    }
  }

  resolveAlias (path: string) {
    if (startsWithRootAlias(path)) {
      return join(this.options.rootDir, path.substr(2))
    }

    if (startsWithSrcAlias(path)) {
      return join(this.options.srcDir, path.substr(1))
    }

    return resolve(this.options.srcDir, path)
  }

  resolvePath (path: string, { isAlias, isModule, isStyle }: ResolvePathOptions = {}) {
    // Fast return in case of path exists
    if (fs.existsSync(path)) {
      return path
    }

    let resolvedPath: string

    // Try to resolve it as a regular module
    if (isModule !== false) {
      resolvedPath = this.resolveModule(path)
    }

    // Try to resolve alias
    if (!resolvedPath && isAlias !== false) {
      resolvedPath = this.resolveAlias(path)
    }

    // Use path for resolvedPath
    if (!resolvedPath) {
      resolvedPath = path
    }

    let isDirectory: boolean

    // Check if resolvedPath exits and is not a directory
    if (fs.existsSync(resolvedPath)) {
      isDirectory = fs.lstatSync(resolvedPath).isDirectory()

      if (!isDirectory) {
        return resolvedPath
      }
    }

    const extensions = isStyle ? this.options.styleExtensions : this.options.extensions

    // Check if any resolvedPath.[ext] or resolvedPath/index.[ext] exists
    for (const ext of extensions) {
      if (!isDirectory && fs.existsSync(resolvedPath + '.' + ext)) {
        return resolvedPath + '.' + ext
      }

      const resolvedPathwithIndex = join(resolvedPath, 'index.' + ext)
      if (isDirectory && fs.existsSync(resolvedPathwithIndex)) {
        return resolvedPathwithIndex
      }
    }

    // If there's no index.[ext] we just return the directory path
    if (isDirectory) {
      return resolvedPath
    }

    // Give up
    throw new Error(`Cannot resolve "${path}" from "${resolvedPath}"`)
  }

  tryResolvePath (path: string, options?: ResolvePathOptions) {
    try {
      return this.resolvePath(path, options)
    } catch (e) {
    }
  }

  requireModule <T> (path: string, { useESM, isAlias, interopDefault }: RequireModuleOptions = {}): T {
    let resolvedPath = path
    let requiredModule: any

    let lastError: any

    // Try to resolve path
    try {
      resolvedPath = this.resolvePath(path, { isAlias })
    } catch (e) {
      lastError = e
    }

    const isExternal = isExternalDependency(resolvedPath)

    // in dev mode make sure to clear the require cache so after
    // a dev server restart any changed file is reloaded
    if (this.options.dev && !isExternal) {
      clearRequireCache(resolvedPath)
    }

    // By default use esm only for js,mjs files outside of node_modules
    if (useESM === undefined) {
      useESM = !isExternal && /.(js|mjs)$/.test(resolvedPath)
    }

    // Try to require
    try {
      if (useESM) {
        requiredModule = this._require(resolvedPath)
      } else {
        requiredModule = require(resolvedPath)
      }
    } catch (e) {
      lastError = e
    }

    // Interop default
    if (interopDefault !== false && requiredModule && requiredModule.default) {
      requiredModule = requiredModule.default
    }

    // Throw error if failed to require
    if (requiredModule === undefined && lastError) {
      throw lastError
    }

    return requiredModule
  }
}
