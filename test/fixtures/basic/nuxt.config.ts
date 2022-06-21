import { defineNuxtConfig } from 'nuxt'
import { addComponent } from '@nuxt/kit'

export default defineNuxtConfig({
  buildDir: process.env.NITRO_BUILD_DIR,
  builder: process.env.TEST_WITH_WEBPACK ? 'webpack' : 'vite',
  extends: [
    './extends/bar',
    './extends/node_modules/foo'
  ],
  nitro: {
    output: { dir: process.env.NITRO_OUTPUT_DIR }
  },
  publicRuntimeConfig: {
    testConfig: 123
  },
  privateRuntimeConfig: {
    privateConfig: 'secret_key'
  },
  modules: ['~/modules/example'],
  hooks: {
    'modules:done' () {
      addComponent({
        name: 'CustomComponent',
        export: 'namedExport',
        filePath: '~/other-components-folder/named-export'
      })
    }
  },
  experimental: {
    reactivityTransform: true
  },
  ssr: process.env.SSR_ENABLED !== 'false',
  app: {
    head: {
      script: process.env.SSR_ENABLED === 'false'
        ? [
            {
            // injects the config based on the environment
              src: '/config.js'
            }
          ]
        : []
    }
  }
})
