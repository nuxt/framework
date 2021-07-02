import { resolve } from 'upath'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  name: 'meta',
  setup (_options, nuxt) {
    // Add app plugin to install vue-meta or @vueuse/head
    const runtimeDir = resolve(__dirname, 'runtime')
    // TODO: support configurable meta plugins (vue-meta)
    const metaPlugin = resolve(runtimeDir, 'vueuse-head')

    nuxt.hook('app:resolve', (app) => {
      app.plugins.push({ src: metaPlugin })
    })
  }
})
