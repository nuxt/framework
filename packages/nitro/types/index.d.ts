import './shims'
import { NitroInput } from '../dist'

declare module '@nuxt/schema' {
  interface NuxtOptions {
    nitro: NitroInput
  }
}

export * from './fetch'
export * from '../dist'
