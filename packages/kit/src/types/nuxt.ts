import { NuxtHookName, NuxtHooks } from './hooks'
import { NuxtOptions } from './config'

export interface Nuxt {
  options: NuxtOptions

  hooks: {
    hook<Hook extends NuxtHookName>(hookName: Hook, callback: NuxtHooks[Hook]): void | Promise<void>
    callHook<Hook extends NuxtHookName>(hookName: Hook, ...args: Parameters<NuxtHooks[Hook]>): ReturnType<NuxtHooks[Hook]>
    addHooks(hooks: Partial<NuxtHooks>): void
  }
  hook: Nuxt['hooks']['hook']
  callHook: Nuxt['hooks']['callHook']

  ready: () => Promise<void>
  close: () => Promise<void>

  server?: any
}
