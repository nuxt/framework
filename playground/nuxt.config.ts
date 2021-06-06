import { defineNuxtConfig } from '@nuxt/kit'

export default defineNuxtConfig({
  vite: true,
  buildModules: [
    '../packages/compat'
  ]
})
