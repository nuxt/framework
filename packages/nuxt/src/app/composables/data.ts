import { toRef } from 'vue'
import type { Ref } from 'vue'
import { useNuxtApp } from '../nuxt'

/**
 * Create a global reactive ref that will be hydrated but not shared across ssr requests
 *
 * @param key a unique key ensuring that data fetching can be properly de-duplicated across requests
 */
export function useData <T> (key: string): Ref<T|undefined> {
  if (!key || typeof key !== 'string') {
    throw new TypeError('[nuxt] [useData] key must be a string: ' + key)
  }

  const nuxt = useNuxtApp()

  // Ensure key is not conflicting with asyncData
  // TODO: Can we actually share state with no overhead?
  if (nuxt._asyncData[key]) {
    throw new TypeError(`[nuxt] [useData] Key ${key} is already used by asyncData.`)
  }

  if (!(key in nuxt.payload.data)) {
    nuxt.payload.data[key] = undefined
  }
  const data = toRef(nuxt.payload.data, key) as Ref<T|undefined>

  return data
}
