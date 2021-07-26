import { createHead, renderHeadToString } from '@vueuse/head'
import { defineNuxtPlugin } from '@nuxt/app'
import { ref } from 'vue'

export default defineNuxtPlugin((nuxt) => {
  const head = createHead()

  nuxt.app.use(head)

  head.addHeadObjs(ref({
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  }))

  if (process.server) {
    nuxt.ssrContext.renderMeta = () => renderHeadToString(head)
  }
})
