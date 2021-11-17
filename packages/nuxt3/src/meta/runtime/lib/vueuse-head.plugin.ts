import { createHead, renderHeadToString } from '@vueuse/head'
import { ref, watchEffect, onBeforeUnmount, getCurrentInstance } from 'vue'
import type { MetaObject } from '..'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const head = createHead()

  nuxtApp.vueApp.use(head)

  nuxtApp._useMeta = (meta: MetaObject) => {
    const headObj = ref(meta as any)
    head.addHeadObjs(headObj)

    if (process.server) { return }

    watchEffect(() => {
      head.updateDOM()
    })

    const vm = getCurrentInstance()
    if (!vm) { return }

    onBeforeUnmount(() => {
      head.removeHeadObjs(headObj)
      head.updateDOM()
    })
  }

  if (process.server) {
    nuxtApp.ssrContext.renderMeta = () => renderHeadToString(head)
  }
})
