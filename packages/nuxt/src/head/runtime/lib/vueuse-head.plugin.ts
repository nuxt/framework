import { createHead, useHead } from '@vueuse/head'
import { defineNuxtPlugin } from '#app'
// @ts-expect-error untyped
import { appHead } from '#build/nuxt.config.mjs'

export default defineNuxtPlugin((nuxtApp) => {
  const head = createHead()

  // we can server side render the head without having the client hydrate it
  if (process.server) {
    head.push(appHead, { mode: 'server' })
  }

  if (process.client && nuxtApp.ssrContext?.noSSR) {
    head.push(appHead)
  }

  nuxtApp.vueApp.use(head)

  if (process.client) {
    // pause dom updates until page is ready and between page transitions
    let pauseDOMUpdates = true
    const unpauseDom = () => {
      pauseDOMUpdates = false
      // triggers dom update
      head.hooks.callHook('entries:updated', head)
    }
    head.hooks.hook('dom:beforeRender', (context) => {
      context.shouldRender = !pauseDOMUpdates
    })
    nuxtApp.hooks.hook('page:start', () => { pauseDOMUpdates = true })
    // watch for new route before unpausing dom updates (triggered after suspense resolved)
    nuxtApp.hooks.hook('page:finish', unpauseDom)
    nuxtApp.hooks.hook('app:mounted', unpauseDom)
  }

  nuxtApp._useHead = useHead

  if (process.server) {
    nuxtApp.ssrContext!.renderMeta = async () => {
      const { renderSSRHead } = await import('@unhead/ssr')
      const meta = await renderSSRHead(head)
      return {
        ...meta,
        // resolves naming difference with NuxtMeta and @vueuse/head
        bodyScriptsPrepend: meta.bodyTagsOpen,
        bodyScripts: meta.bodyTags
      }
    }
  }
})
