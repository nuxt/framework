import { resolve } from 'upath'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  name: 'meta',
  setup (_options, nuxt) {
    // Add app plugin to install vue-meta or @vueuse/head
    const runtimeDir = resolve(__dirname, 'runtime')
    // const metaPlugin = resolve(runtimeDir, 'vue-meta')
    // nuxt.options.build.transpile.push('vue-meta', 'vue-meta/ssr')
    const metaPlugin = resolve(runtimeDir, 'vueuse-head')
    const commonPlugin = resolve(runtimeDir, 'meta')

    nuxt.hook('app:resolve', (app) => {
      app.plugins.push({ src: metaPlugin }, { src: commonPlugin })
    })
  }
})
