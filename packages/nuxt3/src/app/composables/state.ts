import { toRef } from 'vue'
import type { Ref } from 'vue'
import { useNuxtApp } from '#app'

/**
 * Create a global reactive ref that will be hydrated but not shared across ssr requests
 *
 * @param key a unique key ensuring that data fetching can be properly de-duplicated across requests
 * @param init a function that provides initial value for the state when it's not initiated
 */
export const useState = <T> (key: string, init?: (() => T)): Ref<T> => {
  const nuxt = useNuxtApp()
  const state = toRef(nuxt.payload.state, key)
  if (state.value === undefined && init) {
    state.value = init()
  }
  return state
}
