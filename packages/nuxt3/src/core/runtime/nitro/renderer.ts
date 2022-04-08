import { createRenderer } from 'vue-bundle-renderer'
import { eventHandler, useQuery } from 'h3'
import devalue from '@nuxt/devalue'
import { useRuntimeConfig } from '#nitro'
import { buildAssetsURL } from '#paths'
// @ts-ignore
import htmlTemplate from '#build/views/document.template.mjs'

const STATIC_ASSETS_BASE = process.env.NUXT_STATIC_BASE + '/' + process.env.NUXT_STATIC_VERSION
const NUXT_NO_SSR = process.env.NUXT_NO_SSR
const PAYLOAD_JS = '/payload.js'

const getClientManifest = cachedImport(() => import('#build/dist/server/client.manifest.mjs'))
const getSSRApp = !process.env.NUXT_NO_SSR && cachedImport(() => import('#build/dist/server/server.mjs'))

const getSSRRenderer = cachedResult(async () => {
  // Load client manifest
  const clientManifest = await getClientManifest()
  if (!clientManifest) { throw new Error('client.manifest is not available') }
  // Load server bundle
  const createSSRApp = await getSSRApp()
  if (!createSSRApp) { throw new Error('Server bundle is not available') }
  // Create renderer
  const { renderToString } = await import('#vue-renderer') // Alias to vue2.ts or vue3.ts
  return createRenderer((createSSRApp), { clientManifest, renderToString, publicPath: buildAssetsURL() }).renderToString
})

const getSPARenderer = cachedResult(async () => {
  const clientManifest = await getClientManifest()
  return (ssrContext) => {
    const config = useRuntimeConfig()
    ssrContext.nuxt = {
      serverRendered: false,
      config: {
        ...config.public,
        app: config.app
      }
    }

    let entryFiles = Object.values(clientManifest).filter(
      (fileValue: any) => fileValue.isEntry
    )
    if ('all' in clientManifest && 'initial' in clientManifest) {
      // Upgrade legacy manifest (also see normalizeClientManifest in vue-bundle-renderer)
      // https://github.com/nuxt-contrib/vue-bundle-renderer/issues/12
      entryFiles = clientManifest.initial.map(file => ({ file }))
    }

    return {
      html: '<div id="__nuxt"></div>',
      renderResourceHints: () => '',
      renderStyles: () =>
        entryFiles
          .flatMap(({ css }) => css)
          .filter(css => css != null)
          .map(file => `<link rel="stylesheet" href="${buildAssetsURL(file)}">`)
          .join(''),
      renderScripts: () =>
        entryFiles
          .map(({ file }) => {
            const isMJS = !file.endsWith('.js')
            return `<script ${isMJS ? 'type="module"' : ''} src="${buildAssetsURL(file)}"></script>`
          })
          .join('')
    }
  }
})

function renderToString (ssrContext) {
  const getRenderer = (NUXT_NO_SSR || ssrContext.noSSR) ? getSPARenderer : getSSRRenderer
  return getRenderer().then(renderToString => renderToString(ssrContext))
}

export default eventHandler(async (event) => {
  // Whether we're rendering an error page
  const ssrError = event.req.url?.startsWith('/__error') ? useQuery(event) : null
  let url = ssrError?.url as string || event.req.url!

  // payload.json request detection
  let isPayloadReq = false
  if (url.startsWith(STATIC_ASSETS_BASE) && url.endsWith(PAYLOAD_JS)) {
    isPayloadReq = true
    url = url.slice(STATIC_ASSETS_BASE.length, url.length - PAYLOAD_JS.length) || '/'
  }

  // Initialize ssr context
  const config = useRuntimeConfig()
  const ssrContext = {
    url,
    event,
    req: event.req,
    res: event.res,
    runtimeConfig: { private: config, public: { ...config.public, app: config.app } },
    noSSR: event.req.headers['x-nuxt-no-ssr'],

    error: ssrError,
    redirected: undefined,
    nuxt: undefined, /* NuxtApp */
    payload: undefined
  }

  // Render app
  const rendered = await renderToString(ssrContext).catch((e) => {
    if (!ssrError) { throw e }
  })

  // If we error on rendering error page, we bail out and directly return to the error handler
  if (!rendered) { return }

  if (ssrContext.redirected || event.res.writableEnded) {
    return
  }

  const error = ssrContext.error /* nuxt 3 */ || ssrContext.nuxt?.error
  // Handle errors
  if (error && !ssrError) {
    throw error
  }

  if (ssrContext.nuxt?.hooks) {
    await ssrContext.nuxt.hooks.callHook('app:rendered')
  }

  // TODO: nuxt3 should not reuse `nuxt` property for different purpose!
  const payload = ssrContext.payload /* nuxt 3 */ || ssrContext.nuxt /* nuxt 2 */

  if (process.env.NUXT_FULL_STATIC) {
    payload.staticAssetsBase = STATIC_ASSETS_BASE
  }

  let data
  if (isPayloadReq) {
    data = renderPayload(payload, url)
    event.res.setHeader('Content-Type', 'text/javascript;charset=UTF-8')
  } else {
    data = await renderHTML(payload, rendered, ssrContext)
    event.res.setHeader('Content-Type', 'text/html;charset=UTF-8')
  }

  event.res.end(data, 'utf-8')
})

async function renderHTML (payload, rendered, ssrContext) {
  const state = `<script>window.__NUXT__=${devalue(payload)}</script>`
  const html = rendered.html

  if ('renderMeta' in ssrContext) {
    rendered.meta = await ssrContext.renderMeta()
  }

  const {
    htmlAttrs = '',
    bodyAttrs = '',
    headAttrs = '',
    headTags = '',
    bodyScriptsPrepend = '',
    bodyScripts = ''
  } = rendered.meta || {}

  return htmlTemplate({
    HTML_ATTRS: htmlAttrs,
    HEAD_ATTRS: headAttrs,
    HEAD: headTags +
      rendered.renderResourceHints() + rendered.renderStyles() + (ssrContext.styles || ''),
    BODY_ATTRS: bodyAttrs,
    BODY_PREPEND: ssrContext.teleports?.body || '',
    APP: bodyScriptsPrepend + html + state + rendered.renderScripts() + bodyScripts
  })
}

function renderPayload (payload, url) {
  return `__NUXT_JSONP__("${url}", ${devalue(payload)})`
}

function _interopDefault (e) {
  return e && typeof e === 'object' && 'default' in e ? e.default : e
}

function cachedImport <M> (importer: () => Promise<M>) {
  return cachedResult(() => importer().then(_interopDefault)) as () => Promise<M>
}

function cachedResult <T> (fn: () => Promise<T>): () => Promise<T> {
  let res: Promise<T> | null = null
  return () => {
    if (res === null) {
      res = fn().catch((err) => { res = null; throw err })
    }
    return res
  }
}
