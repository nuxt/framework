import { createHead, HeadEntryOptions, renderHeadToString } from '@vueuse/head'
import { computed, ref, watchEffect, onBeforeUnmount, getCurrentInstance, isRef } from 'vue'
import defu from 'defu'
import { MaybeComputedRef } from '@vueuse/shared'
import type { MetaObject, MetaObjectPlain } from '@nuxt/schema'
import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const head = createHead()

  nuxtApp.vueApp.use(head)

  let headReady = false
  nuxtApp.hooks.hookOnce('app:mounted', () => {
    watchEffect(() => { head.updateDOM() })
    headReady = true
  })

  // pause dom updates in between page transitions
  let pauseDOMUpdates = false
  head.hookBeforeDomUpdate.push(() => !pauseDOMUpdates)
  nuxtApp.hooks.hookOnce('page:finish', () => {
    pauseDOMUpdates = false
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

  nuxtApp._useHead = (_meta: MaybeComputedRef<MetaObject>, options: HeadEntryOptions) => {
    const meta = isRef(_meta) ? _meta : ref<MetaObject>(_meta as MetaObject)
    const headObj = computed(() => {
      const overrides: MetaObjectPlain = { meta: [] }
      if (meta.value.charset) {
        overrides.meta!.push({ charset: meta.value.charset })
      }
      if (meta.value.viewport) {
        overrides.meta!.push({ name: 'viewport', content: meta.value.viewport })
      }
      return defu(overrides, meta.value)
    })
    const removeHeadObjs = head.addHeadObjs(headObj as any, options)

    if (process.server) { return }

    if (headReady) {
      watchEffect(() => { head.updateDOM() })
    }

    const vm = getCurrentInstance()
    if (!vm) { return }

    onBeforeUnmount(() => {
      removeHeadObjs()
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
