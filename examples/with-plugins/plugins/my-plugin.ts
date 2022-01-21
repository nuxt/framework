import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      myPlugin: { data: 'Data coming from my auto-imported plugin' }
    }
  }
})
