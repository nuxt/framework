import { defineNuxtConfig } from 'nuxt3'
import { createResolver } from '@nuxt/kit'

setTimeout(() => { createResolver(import.meta.url).resolvePath('ufo').then(console.log) }, 2000)
export default defineNuxtConfig({
  extends: './base',
  modules: [
    '@nuxt/ui'
  ]
})
