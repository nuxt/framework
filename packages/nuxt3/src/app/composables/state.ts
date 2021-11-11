/* eslint-disable no-redeclare */
import { toRef } from 'vue'
import type { Ref, InjectionKey } from 'vue'
import { useNuxtApp } from '#app'

/**
 * Create a global reactive ref that will be hydrated but not shared across ssr requests
 *
 * @param key a unique key ensuring that data fetching can be properly de-duplicated across requests
 * @param init a function that provides initial value for the state when it's not initiated
 */
export function useState<T> (key: InjectionKey<T>): Ref<T | undefined>
export function useState<T = any> (key: string): Ref<T | undefined>
export function useState<T> (key: InjectionKey<T>, init: (() => T)): Ref<T>
export function useState<T = any> (key: string, init: (() => T)): Ref<T>
export function useState<T = any> (key: InjectionKey<T> | string, init?: (() => T)): Ref<T> {
  const nuxt = useNuxtApp()
  const state = toRef(nuxt.payload.state, key.toString()) // Symbols will end up like "Symbol('key')" which is good enough
  if (state.value === undefined && init) {
    state.value = init()
  }
  return state
}
