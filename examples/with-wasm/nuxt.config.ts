import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  nitro: {
    experiments: {
      wasm: true
    }
  },
  buildModules: [
    '@nuxt/ui'
  ]
})
