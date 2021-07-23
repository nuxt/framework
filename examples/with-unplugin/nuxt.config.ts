import { defineNuxtConfig } from '@nuxt/kit'

export default defineNuxtConfig({
  vite: false,
  modules: [
    './modules/unplugin.ts'
  ]
})
