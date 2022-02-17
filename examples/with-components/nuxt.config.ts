import { defineNuxtConfig } from 'nuxt3'
import { addComponent } from '@nuxt/kit'

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui'
  ],
  components: {
    dirs: [
      '~/components',
      {
        path: '~/other-components-folder',
        extensions: ['vue'],
        prefix: 'nuxt'
      }
    ]
  },
  hooks: {
    'modules:done' () {
      addComponent({
        name: 'CustomComponent',
        export: 'namedExport',
        filePath: '~/other-components-folder/named-export'
      })
    }
  }
})
