import type { NuxtConfig as _NuxtConfig } from '@nuxt/kit'

export interface BridgeConfig {
  nitro: boolean
  vite: boolean
  app: boolean | {}
  capi: boolean | {}
  globalImports: boolean
  constraints: boolean
  postcss8: boolean
  swc: boolean
  resolve: boolean
  typescript: boolean
}

// TODO: Alaso inherit from @nuxt/types.NuxtConfig for legacy type compat
export interface NuxtConfig extends _NuxtConfig {
  bridge?: Partial<BridgeConfig>
}

declare module '@nuxt/kit' {
  interface ConfigSchema {
    bridge: BridgeConfig
  }
}

export interface DefineeNuxtConfigOpts { injectBridge?: Boolean }
export declare function defineNuxtConfig(config: NuxtConfig, opts?: DefineeNuxtConfigOpts): NuxtConfig
