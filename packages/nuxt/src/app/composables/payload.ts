import { parseURL } from 'ufo'
import { useNuxtApp } from '../nuxt'

export function loadPayload (url: string, forceRefetch: boolean = false) {
  const parsed = parseURL(url)
  if (parsed.search) {
    throw new Error('Payload URLs cannot contain search params')
  }

  const nuxtApp = useNuxtApp()
  const cache = nuxtApp._payloadCache = nuxtApp._payloadCache || {}

  const payloadURL = parsed.pathname + '/_payload.json'

  if (!forceRefetch && cache[payloadURL]) {
    return cache[payloadURL]
  }

  cache[url] = _importPayload(payloadURL + (forceRefetch ? '?_=' + Date.now() : ''))
  return cache[url]
}

async function _importPayload (payloadURL: string) {
  const { payload } = await import(payloadURL /* @vite-ignore */) as { payload: any }
  return payload
}
