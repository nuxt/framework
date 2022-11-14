import { createHead, useHead } from '@vueuse/head'
import { defineNuxtPlugin } from '#app'
// @ts-expect-error untyped
import { appHead } from '#build/nuxt.config.mjs'

export default defineNuxtPlugin((nuxtApp) => {
  const head = createHead()

  head.push(appHead, {
    // for SSR we don't need to hydrate this entry
    mode: nuxtApp.ssrContext?.noSSR ? 'all' : 'server'
  })

  nuxtApp.vueApp.use(head)

  if (process.client) {
    // pause dom updates until page is ready and between page transitions
    let pauseDOMUpdates = true
    const unpauseDom = () => {
      pauseDOMUpdates = false
      // triggers dom update
      head.internalHooks.callHook('entries:updated', head.unhead)
    }
    head.internalHooks.hook('dom:beforeRender', (context) => {
      context.shouldRender = !pauseDOMUpdates
    })
    nuxtApp.hooks.hook('page:start', () => { pauseDOMUpdates = true })
    // watch for new route before unpausing dom updates (triggered after suspense resolved)
    nuxtApp.hooks.hook('page:finish', unpauseDom)
    nuxtApp.hooks.hook('app:mounted', unpauseDom)
  }

  // basic support for users to modify tags before render
  head.internalHooks.hook('tags:resolve', ctx => nuxtApp.hooks.callHook('head:tags:resolve', ctx))

  // useHead does not depend on a vue component context, we keep it on the nuxtApp for backwards compatibility
  nuxtApp._useHead = useHead

  if (process.server) {
    nuxtApp.ssrContext!.renderMeta = async () => {
      const { renderSSRHead } = await import('@unhead/ssr')
      const meta = await renderSSRHead(head.unhead)
      return {
        ...meta,
        bodyScriptsPrepend: meta.bodyTagsOpen,
        // resolves naming difference with NuxtMeta and @vueuse/head
        bodyScripts: meta.bodyTags
      }
    }
  }
})
