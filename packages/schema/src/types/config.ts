import { ConfigSchema } from '../../schema/config'
import type { ResolvedConfig } from 'c12'
import { UserConfig } from 'vite'
import { Options as VuePluginOptions } from '@vitejs/plugin-vue'

type DeepPartial<T> = T extends Function ? T : T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]> } : T

/** User configuration in `nuxt.config` file */
export interface NuxtConfig extends DeepPartial<Omit<ConfigSchema, 'vite'>> {
  vite?: ConfigSchema['vite']
  [key: string]: any
}

/** Normalized Nuxt options available as `nuxt.options.*` */
export interface NuxtOptions extends ConfigSchema {
  _layers: ResolvedConfig<NuxtConfig>[]
}

type RuntimeConfigNamespace = Record<string, any>

export interface PublicRuntimeConfig extends RuntimeConfigNamespace { }

// TODO: remove before release of 3.0.0
/** @deprecated use RuntimeConfig interface */
export interface PrivateRuntimeConfig extends RuntimeConfigNamespace { }

export interface RuntimeConfig extends PrivateRuntimeConfig, RuntimeConfigNamespace {
  public: PublicRuntimeConfig
}

export interface ViteConfig extends UserConfig {
  /**
   * Options passed to @vitejs/plugin-vue
   * @see https://github.com/vitejs/vite/tree/main/packages/plugin-vue
   */
  vue?: VuePluginOptions
}
