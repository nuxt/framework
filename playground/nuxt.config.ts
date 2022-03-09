import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  extends: './base',
  modules: [
    '@nuxt/ui'
  ],
  privateRuntimeConfig: {
    secret: '123',
    foo: {
      bar: '123'
    }
  }
})
