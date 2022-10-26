import { ConfigSchema } from '../../schema/config'

type DeepPartial<T> = T extends Function ? T : T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]> } : T

/** User configuration in `nuxt.config` file */
export interface Nuxt2Config extends DeepPartial<Omit<ConfigSchema, 'vite'>> {
  // Avoid DeepPartial for vite config interface (#4772)
  vite?: ConfigSchema['vite']
  [key: string]: any
}

/** Normalized Nuxt options available as `nuxt.options.*` */
export interface Nuxt2Options extends ConfigSchema {
}
