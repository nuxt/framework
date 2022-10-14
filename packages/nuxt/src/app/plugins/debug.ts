import { createDebugger } from 'hookable'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // @ts-expect-error remove in next version of hookable
  createDebugger(nuxtApp.hooks, {
    tag: 'nuxt app'
  })
})
