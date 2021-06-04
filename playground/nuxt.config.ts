import { defineNuxtConfig } from '@nuxt/kit'

export default defineNuxtConfig({
  vite: false,
  build: {
    transpile: ['vue-meta']
  }
})
