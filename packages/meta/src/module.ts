import { resolve } from 'upath'
import { addTemplate, defineNuxtModule } from '@nuxt/kit'

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

    nuxt.hook('app:resolve', (app) => {
      const { dst: implementation } = addTemplate({
        src: resolve(runtimeDir, 'vueuse-head.mjs'),
        options: {
          defaults: JSON.stringify({
            meta: [
              { charset: options.charset },
              { name: 'viewport', content: options.viewport }
            ]
          })
        }
      })
      app.plugins.push({ src: resolve(nuxt.options.buildDir, implementation) })
      app.plugins.push({ src: resolve(runtimeDir, 'meta') })
    })
  }
})
