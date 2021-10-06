import { resolve } from 'pathe'
import defu from 'defu'
import { resolveModule, defineNuxtModule, addTemplate, addPlugin } from '@nuxt/kit'
import type { MetaObject } from '../../nuxt3/src/meta/runtime'
import { distDir } from './dirs'

const checkDocsMsg = 'Please see https://v3.nuxtjs.org for more information.'
const msgPrefix = '[bridge] [meta]'

export default defineNuxtModule({
  name: 'meta',
  defaults: {
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1'
  },
  setup (options, nuxt) {
    // Alias vue to a vue3-compat version of vue2
    nuxt.options.alias['#vue'] = nuxt.options.alias.vue || resolveModule('vue/dist/vue.runtime.esm.js', { paths: nuxt.options.modulesDir })
    nuxt.options.alias['@vue/shared'] = 'vue'
    nuxt.options.alias['@vue/reactivity'] = 'vue'
    nuxt.options.alias.vue = resolve(distDir, 'runtime/vue.mjs')

    // Turn off vue-meta and migrate configuration
    nuxt.options.features.meta = false
    if (nuxt.options.head) {
      if (typeof nuxt.options.head === 'function') {
        throw new TypeError(`${msgPrefix} Please move head() function from \`nuxt.config\` to \`app.vue\`. ${checkDocsMsg}`)
      } else {
        console.warn(`${msgPrefix} Please rename \`head\` to \`meta\` in your \`nuxt.config\`. ${checkDocsMsg}`)
        nuxt.options.meta = defu(nuxt.options.meta, nuxt.options.head)
      }
    }

    const runtimeDir = resolve(distDir, 'runtime/meta')

    // Transpile @nuxt/meta and @vueuse/head
    nuxt.options.build.transpile.push(runtimeDir, 'vue', '@vueuse/head')

    // Add #meta alias
    nuxt.options.alias['#meta'] = runtimeDir

    // Global meta
    const globalMeta: MetaObject = defu(nuxt.options.meta, {
      meta: [
        { charset: options.charset },
        { name: 'viewport', content: options.viewport }
      ]
    })

    // Add global meta configuration
    addTemplate({
      filename: 'meta.config.mjs',
      getContents: () => 'export default ' + JSON.stringify({ globalMeta, mixinKey: 'setup' })
    })

    // Add generic plugin
    addPlugin({ src: resolve(runtimeDir, 'plugin') })

    // Add library specific plugin
    addPlugin({ src: resolve(runtimeDir, 'lib/vueuse-head.plugin') })
  }
})
