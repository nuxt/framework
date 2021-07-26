import { createHead, renderHeadToString } from '@vueuse/head'
import { defineNuxtPlugin } from '@nuxt/app'
import { ref } from 'vue'

export default defineNuxtPlugin((nuxt) => {
  const head = createHead()

  nuxt.app.use(head)

  head.addHeadObjs(ref(<%= options.defaults %>))

  if (process.server) {
    nuxt.ssrContext.renderMeta = () => renderHeadToString(head)
  }
})
