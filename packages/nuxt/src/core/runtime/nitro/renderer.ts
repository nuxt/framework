import { createRenderer } from 'vue-bundle-renderer'
import { eventHandler, useQuery } from 'h3'
import devalue from '@nuxt/devalue'
import { renderToString as _renderToString } from 'vue/server-renderer'
import type { NuxtApp } from '#app'

// @ts-ignore
import { useRuntimeConfig, useNitroApp } from '#internal/nitro'
// @ts-ignore
import { buildAssetsURL } from '#paths'

export type NuxtSSRContext = NuxtApp['ssrContext']

export interface NuxtRenderContext {
  ssrContext: NuxtSSRContext
  body: string
  meta: {
    htmlAttrs: string[]
    head: string[]
    bodyAttrs: string[]
    bodyPreprend: string[]
    bodyAppend: string[]
  }
}

// @ts-ignore
const getClientManifest = () => import('#build/dist/server/client.manifest.mjs')
  .then(r => r.default || r)
  .then(r => typeof r === 'function' ? r() : r)

// @ts-ignore
const getServerEntry = () => import('#build/dist/server/server.mjs').then(r => r.default || r)

// -- SSR Renderer --
const getSSRRenderer = lazyCachedFunction(async () => {
  // Load client manifest
  const clientManifest = await getClientManifest()
  if (!clientManifest) { throw new Error('client.manifest is not available') }

  // Load server bundle
  const createSSRApp = await getServerEntry()
  if (!createSSRApp) { throw new Error('Server bundle is not available') }

  // Create renderer
  const renderer = createRenderer(createSSRApp, {
    clientManifest,
    renderToString,
    publicPath: buildAssetsURL()
  })

  async function renderToString (input, context) {
    const html = await _renderToString(input, context)
    // In development with vite-node, the manifest is on-demand and will be available after rendering
    if (process.dev && process.env.NUXT_VITE_NODE_OPTIONS) {
      renderer.rendererContext.updateManifest(await getClientManifest())
    }
    return `<div id="__nuxt">${html}</div>`
  }

  return renderer
})

// -- SPA Renderer --
const getSPARenderer = lazyCachedFunction(async () => {
  const clientManifest = await getClientManifest()
  const renderToString = (ssrContext: NuxtSSRContext) => {
    const config = useRuntimeConfig()
    ssrContext.payload = {
      serverRendered: false,
      config: {
        public: config.public,
        app: config.app
      }
    }

    let entryFiles = Object.values(clientManifest).filter((fileValue: any) => fileValue.isEntry)
    if ('all' in clientManifest && 'initial' in clientManifest) {
      // Upgrade legacy manifest (also see normalizeClientManifest in vue-bundle-renderer)
      // https://github.com/nuxt-contrib/vue-bundle-renderer/issues/12
      entryFiles = clientManifest.initial.map(file => ({ file }))
    }

    return Promise.resolve({
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
    })
  }

  return { renderToString }
})

export default eventHandler(async (event) => {
  // Whether we're rendering an error page
  const ssrError = event.req.url?.startsWith('/__nuxt_error') ? useQuery(event) : null
  const url = ssrError?.url as string || event.req.url!

  // Initialize ssr context
  const ssrContext: NuxtSSRContext = {
    url,
    event,
    req: event.req,
    res: event.res,
    runtimeConfig: useRuntimeConfig(),
    noSSR: !!event.req.headers['x-nuxt-no-ssr'],
    error: ssrError,
    nuxt: undefined, /* NuxtApp */
    payload: undefined
  }

  // Render app
  const renderer = (process.env.NUXT_NO_SSR || ssrContext.noSSR) ? await getSPARenderer() : await getSSRRenderer()
  const _rendered = await renderer.renderToString(ssrContext).catch((err) => {
    if (!ssrError) { throw err }
  })

  // Handle errors
  if (!_rendered) {
    return
  }
  if (ssrContext.error && !ssrError) {
    throw ssrContext.error
  }

  // Render meta
  const renderedMeta = await ssrContext.renderMeta()

  // Create render conrtext
  const rendered: NuxtRenderContext = {
    ssrContext,
    body: _rendered.html, // TODO: Rename to _rendered.body in next vue-bundle-renderer
    meta: {
      htmlAttrs: normalizeMeta([renderedMeta.htmlAttrs]),
      bodyAttrs: normalizeMeta([renderedMeta.bodyAttrs]),
      head: normalizeMeta([
        renderedMeta.headTags,
        _rendered.renderResourceHints(),
        _rendered.renderStyles(),
        ssrContext.styles
      ]),
      bodyPreprend: normalizeMeta([
        renderedMeta.bodyScriptsPrepend,
        ssrContext.teleports?.body
      ]),
      bodyAppend: normalizeMeta([
        `<script>window.__NUXT__=${devalue(ssrContext.payload)}</script>`,
        _rendered.renderScripts(),
        renderedMeta.bodyScripts
      ])
    }
  }

  // Allow hooking into the rendered result
  const nitroApp = useNitroApp()
  await ssrContext.nuxt.hooks.callHook('app:rendered', rendered)
  await nitroApp.hooks.callHook('nuxt:app:rendered', rendered)

  // Construct HTML template
  const html = renderHTMLDocument(rendered)
  await nitroApp.hooks.callHook('nuxt:app:rendered:html', { html })

  // Send HTML response
  if (event.res.writableEnded) { return }
  event.res.setHeader('Content-Type', 'text/html;charset=UTF-8')
  return html
})

function lazyCachedFunction <T> (fn: () => Promise<T>): () => Promise<T> {
  let res: Promise<T> | null = null
  return () => {
    if (res === null) {
      res = fn().catch((err) => { res = null; throw err })
    }
    return res
  }
}

function normalizeMeta (meta: string[]) {
  return meta.filter(Boolean).map(i => i.trim())
}

function joinMeta (meta: string[]) {
  return meta.join('')
}

function renderHTMLDocument (rendered: NuxtRenderContext) {
  return `<!DOCTYPE html>
<html ${joinMeta(rendered.meta.htmlAttrs)}>
<head>
  ${joinMeta(rendered.meta.head)}
</head>
<body ${joinMeta(rendered.meta.bodyAttrs)}>${joinMeta(rendered.meta.bodyPreprend)}
${rendered.body}
  ${joinMeta(rendered.meta.bodyAppend)}
</body>
</html>`
}
