import type { HeadEntryOptions } from '@vueuse/head'
import { createHead, renderHeadToString } from '@vueuse/head'
import { onBeforeUnmount, getCurrentInstance } from 'vue'
import { MaybeComputedRef } from '@vueuse/shared'
import type { MetaObject } from '@nuxt/schema'
import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const head = createHead()

  nuxtApp.vueApp.use(head)

  if (process.client) {
    // pause dom updates until page is ready and between page transitions
    let pauseDOMUpdates = true
    head.hooks['before:dom'].push(() => !pauseDOMUpdates)
    nuxtApp.hooks.hookOnce('app:mounted', () => {
      pauseDOMUpdates = false
      head.updateDOM()

      // start pausing DOM updates when route changes (trigger immediately)
      useRouter().beforeEach(() => {
        pauseDOMUpdates = true
      })
      // watch for new route before unpausing dom updates (triggered after suspense resolved)
      useRouter().afterEach(() => {
        pauseDOMUpdates = false
        head.updateDOM()
      })
    })
  }

  nuxtApp._useHead = (_meta: MaybeComputedRef<MetaObject>, options: HeadEntryOptions) => {
    if (process.server) {
      head.addEntry(_meta, options)
      return
    }

    const cleanUp = head.addReactiveEntry(_meta, options)

    const vm = getCurrentInstance()
    if (!vm) { return }

    onBeforeUnmount(() => {
      cleanUp()
      head.updateDOM()
    })
  }

  if (process.server) {
    nuxtApp.ssrContext!.renderMeta = async () => {
      const meta = await renderHeadToString(head)
      return {
        ...meta,
        // resolves naming difference with NuxtMeta and @vueuse/head
        bodyScripts: meta.bodyTags
      }
    }
  }
})
