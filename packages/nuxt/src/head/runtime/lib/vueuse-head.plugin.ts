import { createHead, HeadEntryOptions, renderHeadToString } from '@vueuse/head'
import { watchEffect, onBeforeUnmount, getCurrentInstance, isRef } from 'vue'
import { MaybeComputedRef } from '@vueuse/shared'
import type { MetaObject, MetaObjectPlain } from '@nuxt/schema'
import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const head = createHead()

  nuxtApp.vueApp.use(head)

  if (process.client) {
    // pause dom updates until page is ready and between page transitions
    let pauseDOMUpdates = true
    head.hookBeforeDomUpdate.push(() => !pauseDOMUpdates)
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

  nuxtApp._useHead = (_meta: MaybeComputedRef<MetaObject> | MetaObjectPlain, options: HeadEntryOptions) => {
    const removeSideEffectFns: (() => void)[] = []

    // Handle shortcuts from plain meta only (avoids ref packing / unpacking)
    if (!isRef(_meta) && typeof _meta === 'object') {
      const plainMeta = _meta as MetaObjectPlain
      const shortcutMeta = []
      if (plainMeta.charset) {
        shortcutMeta.push({
          charset: plainMeta.charset
        })
      }
      if (plainMeta.viewport) {
        shortcutMeta.push({
          name: 'viewport',
          content: plainMeta.viewport
        })
      }
      if (shortcutMeta.length) {
        removeSideEffectFns.push(head.addHeadObjs({
          meta: shortcutMeta
        }))
      }
    }

    removeSideEffectFns.push(head.addHeadObjs(_meta, options))

    if (process.server) { return }

    // will happen next tick
    watchEffect(() => { head.updateDOM() })

    const vm = getCurrentInstance()
    if (!vm) { return }

    onBeforeUnmount(() => {
      removeSideEffectFns.forEach(fn => fn())
      head.updateDOM()
    })
  }

  if (process.server) {
    nuxtApp.ssrContext!.renderMeta = () => {
      const meta = renderHeadToString(head)
      return {
        ...meta,
        // resolves naming difference with NuxtMeta and @vueuse/head
        bodyScripts: meta.bodyTags
      }
    }
  }
})
