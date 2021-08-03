import { defineNuxtConfig } from '@nuxt/kit'

export default defineNuxtConfig({
  vite: false,
  buildModules: [
    '@nuxt/global-imports'
  ]
})
