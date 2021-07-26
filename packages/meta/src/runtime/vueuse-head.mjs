import { createHead, renderHeadToString } from '@vueuse/head'
import { defineNuxtPlugin } from '@nuxt/app'
import { ref } from 'vue'

const defaults = ref(<%= options.defaults %>)

export default defineNuxtPlugin((nuxt) => {
  const head = createHead()

  nuxt.app.use(head)

  head.addHeadObjs(defaults)

  if (process.server) {
    nuxt.ssrContext.renderMeta = () => renderHeadToString(head)
  }
})
