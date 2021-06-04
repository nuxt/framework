import type { Plugin } from '@nuxt/app'
import { createMetaManager } from 'vue-meta'

export default <Plugin> async function meta (nuxt) {
  const { app, ssrContext } = nuxt
  const metaManager = createMetaManager(process.server)
  app.use(metaManager)

  if (process.server) {
    const { renderMetaToString } = await import('vue-meta/ssr')
    ssrContext.renderMeta = async () => {
      ssrContext.teleports = ssrContext.teleports || {}

      await renderMetaToString(app, ssrContext)

      return {
        htmlAttrs: ssrContext.teleports.htmlAttrs || '',
        headAttrs: ssrContext.teleports.headAttrs || '',
        bodyAttrs: ssrContext.teleports.bodyAttrs || '',
        headTags: ssrContext.teleports.head || '',
        bodyPrepend: ssrContext.teleports['body-prepend'] || '',
        bodyScripts: ssrContext.teleports.body || ''
      }
    }
  }
}
