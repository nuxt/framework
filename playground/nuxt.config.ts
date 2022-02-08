import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  extends: './base',
  builder: 'webpack',
  modules: [
    '@nuxt/ui'
  ]
})
