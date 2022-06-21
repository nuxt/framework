import { ref } from 'vue'
import { resolve } from 'pathe'
import { addPlugin, addTemplate, defineNuxtModule } from '@nuxt/kit'
import { createHead, renderHeadToString } from '@vueuse/head'
import defu from 'defu'
import { distDir } from '../dirs'
import type { MetaObject } from './runtime'

export default defineNuxtModule({
  meta: {
    name: 'meta'
  },
  defaults: {
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1'
  },
  setup (options, nuxt) {
    const runtimeDir = nuxt.options.alias['#head'] || resolve(distDir, 'head/runtime')

    // Transpile @nuxt/meta and @vueuse/head
    nuxt.options.build.transpile.push('@vueuse/head')

    // Add #head alias
    nuxt.options.alias['#head'] = runtimeDir

    // Global meta -for Bridge, this is necessary to repeat here
    // and in packages/schema/src/config/_app.ts
    const globalMeta: MetaObject = defu(nuxt.options.app.head, {
      charset: options.charset,
      viewport: options.viewport
    })

    if (!nuxt.options.ssr) {
      nuxt.addHooks({
        'nitro:config': (nitro) => {
          const head = createHead()
          head.addHeadObjs(ref(globalMeta))

          nitro.runtimeConfig.meta = renderHeadToString(head)
        }
      })
    }

    // Add global meta configuration
    addTemplate({
      filename: 'meta.config.mjs',
      getContents: () => 'export default ' + JSON.stringify({ globalMeta })
    })

    // Add generic plugin
    addPlugin({ src: resolve(runtimeDir, 'plugin') })

    // Add library specific plugin
    addPlugin({ src: resolve(runtimeDir, 'lib/vueuse-head.plugin') })
  }
})
