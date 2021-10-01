import fs from 'fs'
import defu from 'defu'

import { CachedInputFileSystem, ResolverFactory } from 'enhanced-resolve'
import { ResolveOptions } from 'webpack/types'
import { extendWebpackConfig, useNuxt } from '@nuxt/kit'

type UserResolveOptions = Parameters<typeof ResolverFactory['createResolver']>[0]
type ResolverOptions = Omit<UserResolveOptions, 'fileSystem'> & { fileSystem?: CachedInputFileSystem }

const DEFAULTS: UserResolveOptions = {
  fileSystem: new CachedInputFileSystem(fs, 4000),
  extensions: ['.ts', '.mjs', '.cjs', '.js', '.json'],
  mainFields: ['module', 'main']
}

// Abstracted resolver factory which can be used in rollup, webpack, etc.
const createResolver = (resolveOptions: ResolverOptions) => {
  const options = defu(resolveOptions, DEFAULTS) as UserResolveOptions
  const resolver = ResolverFactory.createResolver(options)

  const root = options.roots?.[0] || '.'

  const resolve = (id: string, importer?: string) => {
    return new Promise<string>((resolve, reject) =>
      resolver.resolve({}, importer || root, id, {}, (err, result) => {
        if (err || !result) {
          return reject(err || new Error(`Could not import '${id}'.`))
        }

        resolve(result)
      })
    )
  }

  return { resolve, resolver }
}

// Webpack plugin to add first-level support for subpath exports, etc.
class EnhancedResolverPlugin {
  resolver: ReturnType<typeof createResolver>

  constructor (options: ResolverOptions) {
    this.resolver = createResolver(options)
  }

  apply (defaultResolver: any) {
    const enhancedResolver = this.resolver

    defaultResolver.getHook('resolve').tapPromise('EnhancedResolverPlugin', async (request) => {
      const id = request.request
      // Fall back to default webpack4 resolver if not a node_modules import
      if (!id || !defaultResolver.isModule(id)) { return }

      const importer = request.context?.issuer
      try {
        const result = await enhancedResolver.resolve(id, importer)
        // Fall back to default webpack4 resolver if we can't resolve id
        if (!result) { return }
        request.path = result
        return request
      } catch {
        // Fall back to default webpack4 resolver in the event of error
      }
    })
  }
}

export function setupBetterResolve () {
  const nuxt = useNuxt()

  extendWebpackConfig((config) => {
    const isServer = config.name === 'server'

    config.resolve = config.resolve || {}
    config.resolve.plugins = config.resolve.plugins || []

    config.resolve.plugins.push(new EnhancedResolverPlugin({
      conditionNames: ['import', ...isServer ? ['node'] : []],
      alias: config.resolve.alias,
      modules: config.resolve.modules,
      plugins: config.resolve.plugins as Array<Exclude<ResolveOptions['plugins'][number], string>>,
      roots: config.resolve.roots || [nuxt.options.rootDir]
    }))
  })
}
