import { getContext } from 'unctx'
import { importModule, tryImportModule, tryResolveModule, RequireModuleOptions } from './utils/cjs'
import type { Nuxt } from './types/nuxt'
import type { NuxtConfig } from './types/config'
import type { LoadNuxtConfigOptions } from './config/load'

/** Direct access to the Nuxt context - see https://github.com/unjs/unctx. */
export const nuxtCtx = getContext<Nuxt>('nuxt')

/**
 * Get access to Nuxt (if run within the Nuxt context) - see https://github.com/unjs/unctx.
 *
 * @example
 * ```js
 * const nuxt = useNuxt()
 * ```
 */
export const useNuxt = nuxtCtx.use

export interface LoadNuxtOptions extends LoadNuxtConfigOptions {
  rootDir: string
  dev?: boolean
  config?: NuxtConfig
  version?: 2 | 3
  configFile?: string
  ready?: boolean
}

export async function loadNuxt (opts: LoadNuxtOptions): Promise<Nuxt> {
  const resolveOpts: RequireModuleOptions = { paths: opts.rootDir }

  // Detect version
  if (!opts.version) {
    opts.version = tryResolveModule('nuxt3', resolveOpts) ? 3 : 2
  }

  // Nuxt 3
  if (opts.version !== 2) {
    const { loadNuxt } = await importModule('nuxt3', resolveOpts)
    const nuxt = await loadNuxt(opts)
    return nuxt
  }

  // Nuxt 2
  const { loadNuxt } = await tryImportModule('nuxt-edge', resolveOpts) || await importModule('nuxt', resolveOpts)
  const nuxt = await loadNuxt({
    rootDir: opts.rootDir,
    for: opts.dev ? 'dev' : 'build',
    configOverrides: opts.config,
    ready: opts.ready,
    envConfig: opts.envConfig
  })
  return nuxt as Nuxt
}

export async function buildNuxt (nuxt: Nuxt): Promise<any> {
  const resolveOpts: RequireModuleOptions = { paths: nuxt.options.rootDir }

  // Nuxt 3
  if (nuxt.options._majorVersion === 3) {
    const { build } = await importModule('nuxt3', resolveOpts)
    return build(nuxt)
  }

  // Nuxt 2
  const { build } = await tryImportModule('nuxt-edge', resolveOpts) || await tryImportModule('nuxt', resolveOpts)
  return build(nuxt)
}
