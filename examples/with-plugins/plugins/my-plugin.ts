import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide(
    'myPlugin',
    { data: 'Data coming from my auto-imported plugin' }
  )
})
