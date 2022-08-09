import { parseURL, joinURL } from 'ufo'
import { useNuxtApp } from '../nuxt'
import { useHead } from '#app'

export function usePayload (url: string, forceRefetch: boolean = false) {
  if (process.server) { return null }
  const payloadURL = _getPayloadURL(url)
  const nuxtApp = useNuxtApp()
  const cache = nuxtApp._payloadCache = nuxtApp._payloadCache || {}
  if (!forceRefetch && cache[payloadURL]) {
    return cache[payloadURL]
  }
  cache[url] = _importPayload(payloadURL + (forceRefetch ? '?_=' + Date.now() : ''))
  return cache[url]
}

export function prefetchPayload (url: string) {
  if (process.server) {
    // TODO: Vite adds ?import in _importPayload ?!
    const payloadURL = _getPayloadURL(url) + '?import'
    useHead({
      link: [
        { rel: 'modulepreload', href: payloadURL }
      ]
    })
  } else if (process.client) {
    usePayload(url).catch((error) => {
      console.warn(`Error while prefetching payload for ${url} :`, error)
    })
  }
}

// --- Internal ---

function _getPayloadURL (url: string) {
  const parsed = parseURL(url)
  if (parsed.search) {
    throw new Error('Payload URL cannot contain search params: ' + url)
  }
  return joinURL(parsed.pathname, '_payload.js')
}

async function _importPayload (payloadURL: string) {
  if (process.server) { return null }
  const { payload } = await import(/* @vite-ignore */ payloadURL) as { payload: any }
  return payload
}
