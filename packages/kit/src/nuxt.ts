/* eslint-disable no-use-before-define */

import { useContext } from 'unctx'
import type Hookable from 'hookable'
import { ConfigSchema } from '../.gen/config'

// Nuxt Config
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]>; }
export interface NuxtConfig extends DeepPartial<ConfigSchema> { }
export interface NuxtOptions extends ConfigSchema { }

// Nuxt hooks
export type NuxtHook<Arg1 = any> = (arg1: Arg1, ...args: any) => Promise<void> | void

export interface NuxtHooks {
  [key: string]: NuxtHook

  'modules:before': NuxtHook<Nuxt>
  'modules:done': NuxtHook<Nuxt>
  'ready': NuxtHook<Nuxt>
}

export type NuxtHookName = keyof NuxtHooks

// Nuxt interface
export interface Nuxt {
  options: NuxtOptions

  hooks: Hookable
  hook(hookName: NuxtHookName, callback: NuxtHook)
  callHook<T extends string>(hookbname: T, ...args: Parameters<NuxtHooks[T]>)

  server?: any
}

export const useNuxt = useContext<Nuxt>('nuxt')

export function defineNuxtConfig (config: NuxtConfig) {
  return config
}
