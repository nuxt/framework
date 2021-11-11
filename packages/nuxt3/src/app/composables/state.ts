/* eslint-disable no-redeclare */
import { toRef } from 'vue'
import type { Ref } from 'vue'
import { useNuxtApp } from '#app'

const stateSymbol = Symbol('nuxt-states')

export interface NuxtStates { }
export type StateKey<T> = string & { [stateSymbol]: T }

/** Return a typed string that can be used as a key for `useState`. */
export const stateKey = <T> (k: string) => k as StateKey<T>

/**
 * Create a global reactive ref that will be hydrated but not shared across ssr requests
 *
 * @param key a unique key ensuring that data fetching can be properly de-duplicated across requests
 * @param init a function that provides initial value for the state when it's not initiated
 */

export function useState<T = unknown, K extends string = string, S = K extends keyof NuxtStates ? NuxtStates[K] : T> (key: K | StateKey<T>): Ref<S | undefined>
export function useState<T = unknown, K extends string = string, S = K extends keyof NuxtStates ? NuxtStates[K] : T> (key: K | StateKey<T>, init: (() => K extends keyof NuxtStates ? NuxtStates[K] : T)): Ref<S>
export function useState (key: string, init?: (() => any)): Ref<any> {
  const nuxt = useNuxtApp()
  const state = toRef(nuxt.payload.state, key)
  if (state.value === undefined && init) {
    state.value = init()
  }
  return state
}
