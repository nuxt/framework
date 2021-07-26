import { resolve } from 'upath'
import { defineNuxtModule, addTemplate } from '@nuxt/kit'
import type { MetaObject } from '@nuxt/meta'

export default defineNuxtModule({
  name: 'meta',
  defaults: {
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1'
  },
  setup (options, nuxt) {
    const runtimeDir = resolve(__dirname, 'runtime')

    nuxt.options.build.transpile.push('@nuxt/meta', runtimeDir)
    nuxt.options.alias['@nuxt/meta'] = resolve(runtimeDir, 'index')

    const globalMeta: MetaObject = {
      meta: [
        { charset: options.charset },
        { name: 'viewport', content: options.viewport }
      ]
    }

    nuxt.hook('app:templates', (app) => {
      // Add global meta configuration
      app.templates.push({
        path: 'meta.config.mjs',
        compile: () => 'export default ' + JSON.stringify({ globalMeta })
      })

      // Add library specific plugin
      app.plugins.push({ src: resolve(runtimeDir, 'lib/vueuse-head.plugin') })

      // Add generic plugin
      app.plugins.push({
        src: resolve(runtimeDir, 'plugin'),
        options: { globalMeta }
      })
    })
  }
})
