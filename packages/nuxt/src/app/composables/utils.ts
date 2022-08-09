import { isRef, ref, Ref } from 'vue'
import { getRequestHeader } from 'h3'
import { useRequestEvent } from './ssr'

export const wrapInRef = <T> (value: T | Ref<T>) => isRef(value) ? value : ref(value)

export function isPrerendering () {
  if (process.client) {
    return false // TODO
  }
  const event = useRequestEvent()
  return !!getRequestHeader(event, 'x-nitro-prerender')
}
