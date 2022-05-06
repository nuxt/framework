import { ConfigSchema } from '../../schema/config'
import type { ResolvedConfig } from 'c12'

type DeepPartial<T> = T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]> } : T

/** User configuration in `nuxt.config` file */
export interface NuxtConfig extends DeepPartial<Omit<ConfigSchema, 'vite'>> {
  vite?: ConfigSchema['vite']
  [key: string]: any
}

/** Normalized Nuxt options available as `nuxt.options.*` */
export interface NuxtOptions extends ConfigSchema {
  _layers: ResolvedConfig<NuxtConfig>[]
}

type RuntimeConfigNamespace = Record<string, any >

export interface PublicRuntimeConfig extends RuntimeConfigNamespace { }

/** @deprecated use RuntimeConfig interface */
export interface PrivateRuntimeConfig extends RuntimeConfigNamespace { }

export interface RuntimeConfig extends PrivateRuntimeConfig, RuntimeConfigNamespace {
  public: PublicRuntimeConfig
}
