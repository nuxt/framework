import { getContext } from 'unctx'
import type { Nuxt } from './types/nuxt'
import type { NuxtConfig } from './types/config'
import type { LoadNuxtConfigOptions } from './config/load'
import { requireModule } from './utils/cjs'

export const nuxtCtx = getContext<Nuxt>('nuxt')

export const useNuxt = nuxtCtx.use

export function defineNuxtConfig (config: NuxtConfig) {
  return config
}

export interface LoadNuxtOptions extends LoadNuxtConfigOptions {
  rootDir: string
  dev?: boolean
  config?: NuxtConfig
  version?: 2 | 3
  configFile?: string
  ready?: boolean
}

export async function loadNuxt (opts: LoadNuxtOptions): Promise<Nuxt> {
  // Nuxt 3
  if (opts.version !== 2) {
    const { loadNuxt } = requireModule('nuxt3')
    const nuxt = await loadNuxt(opts)
    return nuxt
  }

  // Compat
  // @ts-ignore
  const { loadNuxt } = requireModule('nuxt')
  const nuxt = await loadNuxt({
    rootDir: opts.rootDir,
    for: opts.dev ? 'dev' : 'build',
    configOverrides: opts.config,
    ready: opts.ready
  })
  return nuxt as Nuxt
}

export function buildNuxt (nuxt: Nuxt): Promise<any> {
  // Nuxt 3
  if (nuxt.options._majorVersion === 3) {
    const { build } = requireModule('nuxt3')
    return build(nuxt)
  }

  // Compat
  // @ts-ignore
  const { build } = requireModule('nuxt')
  return build(nuxt)
}
