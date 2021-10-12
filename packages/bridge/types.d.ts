import type {} from '@nuxt/nitro'
import type { NuxtConfig as _NuxtConfig } from '@nuxt/kit'
import type { ConfigSchema as _ConfigSchema } from '@nuxt/kit/schema/config'
import type { MetaInfo } from 'vue-meta'

export interface BridgeConfig {
  nitro: boolean
  vite: boolean
  app: boolean | {}
  capi: boolean | {}
  scriptSetup: boolean
  autoImports: boolean
  transpile: boolean
  constraints: boolean
  postcss8: boolean
  resolve: boolean
  typescript: boolean
  meta: boolean | null
}

// TODO: Also inherit from @nuxt/types.NuxtConfig for legacy type compat
export interface NuxtConfig extends _NuxtConfig {}

declare module '@nuxt/kit' {
  interface ConfigSchema {
    bridge: BridgeConfig
    head: _ConfigSchema['head'] | MetaInfo
  }
}

export declare function defineNuxtConfig(config: NuxtConfig): NuxtConfig
