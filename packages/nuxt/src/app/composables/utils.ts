import { isRef, ref, Ref } from 'vue'
import { useNuxtApp } from '#app'

export const wrapInRef = <T> (value: T | Ref<T>) => isRef(value) ? value : ref(value)

export function isPrerender () {
  // Note: Alternative for server is checking x-nitro-prerender header
  const nuxtApp = useNuxtApp()
  return !!nuxtApp.payload.prerenderedAt
}
