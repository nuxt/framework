import './shims'
import { NitroInput } from '../dist'

declare module '@nuxt/kit' {
  interface ConfigSchema {
    nitro: NitroInput
  }
}

export * from './fetch'
export * from '../dist'

export interface PublicRuntimeConfig extends Record<string, any> { }
export interface PrivateRuntimeConfig extends PublicRuntimeConfig { }
