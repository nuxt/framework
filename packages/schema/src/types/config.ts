import { ConfigSchema } from '../../schema/config'

/** Normalized Nuxt options */
export interface NuxtOptions extends ConfigSchema { }

type DeepPartial<T> = T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]> | T[P] } : T

/** User configuration (may be different from normalized NuxtOptions) */
export interface NuxtConfig extends DeepPartial<ConfigSchema> { }


export interface PublicRuntimeConfig extends Record<string, any> { }
export interface PrivateRuntimeConfig extends PublicRuntimeConfig { }

type _RuntimeConfig = PublicRuntimeConfig & Partial<PrivateRuntimeConfig>
export interface RuntimeConfig extends _RuntimeConfig { }
