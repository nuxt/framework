import { ConfigSchema } from '../.gen/config'

// Nuxt Config
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]>; }
export interface NuxtConfig extends DeepPartial<ConfigSchema> { }
export interface NuxtOptions extends ConfigSchema { }

// Nuxt hooks
export type NuxtHookCallback = (...args: any[]) => Promise<undefined> | undefined

export interface NuxtHooks {
  [key: string]: NuxtHookCallback
}

export type NuxtHookName = keyof NuxtHooks

// Nuxt interface
export interface Nuxt {
  options: NuxtOptions
  hook(hookName: NuxtHookName, callback: NuxtHookCallback)
  callHook(hookbname: NuxtHookName, ...args: any[])

  resolver: any
}
