import { defineNuxtPlugin } from '@nuxt/app'
import { createMetaManager } from 'vue-meta'

export default defineNuxtPlugin((nuxt) => {
  const { app, ssrContext } = nuxt
  const metaManager = createMetaManager(process.server)
  app.use(metaManager)

  if (process.server) {
    nuxt.hook('app:renderMeta', async (meta) => {
      const { renderMetaToString } = await import('vue-meta/ssr')
      ssrContext.teleports = ssrContext.teleports || {}

      await renderMetaToString(app, ssrContext)

      Object.assign(meta, {
        htmlAttrs: ssrContext.teleports.htmlAttrs || '',
        headAttrs: ssrContext.teleports.headAttrs || '',
        bodyAttrs: ssrContext.teleports.bodyAttrs || '',
        headTags: ssrContext.teleports.head || '',
        bodyPrepend: ssrContext.teleports['body-prepend'] || '',
        bodyScripts: ssrContext.teleports.body || ''
      })
    })
  }
})
