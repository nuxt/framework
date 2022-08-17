import { ConfigSchema } from '../../schema/config'
import type { ResolvedConfig } from 'c12'
import type { UserConfig as ViteUserConfig } from 'vite'
import type { Options as VuePluginOptions } from '@vitejs/plugin-vue'

type DeepPartial<T> = T extends Function ? T : T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]> } : T

/** User configuration in `nuxt.config` file */
export interface NuxtConfig extends DeepPartial<Omit<ConfigSchema, 'vite'>> {
  // Avoid DeepPartial for vite config interface (#4772)
  vite?: ConfigSchema['vite']
  [key: string]: any
}

/** Normalized Nuxt options available as `nuxt.options.*` */
export interface NuxtOptions extends ConfigSchema {
  _layers: ResolvedConfig<NuxtConfig>[]
}

export interface ViteConfig extends ViteUserConfig {
  /**
   * Options passed to @vitejs/plugin-vue
   * @see https://github.com/vitejs/vite/tree/main/packages/plugin-vue
   */
  vue?: VuePluginOptions
}


// -- Runtime Config --

type RuntimeConfigNamespace = Record<string, any>

export interface PublicRuntimeConfig extends RuntimeConfigNamespace { }

// TODO: remove before release of 3.0.0
/** @deprecated use RuntimeConfig interface */
export interface PrivateRuntimeConfig extends RuntimeConfigNamespace { }

export interface RuntimeConfig extends PrivateRuntimeConfig, RuntimeConfigNamespace {
  public: PublicRuntimeConfig
}

// -- App Config --
export interface AppConfigInput extends Record<string, any> {
  /** @deprecated reserved */
  private?: never
  /** @deprecated reserved */
  nuxt?: never
  /** @deprecated reserved */
  nitro?: never
}

export interface AppConfig { }
