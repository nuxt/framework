import '#polyfill'
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import { joinURL } from 'ufo'
import { localCall } from '../server'
import { requestHasBody, useRequestBody } from '../server/utils'
import config from '#config'

const PUBLIC_PATH = joinURL(config.app.basePath, config.app.buildAssetsPath) // Default: /_nuxt/

addEventListener('fetch', (event: any) => {
  event.respondWith(handleEvent(event))
})

async function handleEvent (event) {
  try {
    return await getAssetFromKV(event, { cacheControl: assetsCacheControl, mapRequestToAsset: publicPathModifier })
  } catch (_err) {
    // Ignore
  }

  const url = new URL(event.request.url)
  let body
  if (requestHasBody(event.request)) {
    body = await useRequestBody(event.request)
  }

  const r = await localCall({
    event,
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: event.request.headers,
    method: event.request.method,
    redirect: event.request.redirect,
    body
  })

  return new Response(r.body, {
    // @ts-ignore
    headers: r.headers,
    status: r.status,
    statusText: r.statusText
  })
}

function assetsCacheControl (request) {
  if (request.url.startsWith(PUBLIC_PATH)) {
    return {
      browserTTL: 31536000,
      edgeTTL: 31536000
    }
  }
  return {}
}

const publicPathModifier = (request: Request) => {
  const url = request.url.replace(config.app.basePath, '/')
  return mapRequestToAsset(new Request(url, request))
}
