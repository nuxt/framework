import { defineNuxtPlugin } from '@nuxt/app'
import { createMetaManager } from 'vue-meta'

export default defineNuxtPlugin((nuxt) => {
  const metaManager = createMetaManager(process.server)
  nuxt.app.use(metaManager)

  if (process.server) {
    nuxt.ssrContext.renderMeta = async () => {
      const { renderMetaToString } = await import('vue-meta/ssr')
      nuxt.ssrContext.teleports = nuxt.ssrContext.teleports || {}

      await renderMetaToString(nuxt.app, nuxt.ssrContext)

      return {
        htmlAttrs: nuxt.ssrContext.teleports.htmlAttrs || '',
        headAttrs: nuxt.ssrContext.teleports.headAttrs || '',
        bodyAttrs: nuxt.ssrContext.teleports.bodyAttrs || '',
        headTags: nuxt.ssrContext.teleports.head || '',
        bodyPrepend: nuxt.ssrContext.teleports['body-prepend'] || '',
        bodyScripts: nuxt.ssrContext.teleports.body || ''
      }
    }
  }
})
