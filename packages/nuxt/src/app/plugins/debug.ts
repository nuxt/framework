import { defineNuxtPlugin } from '#app'

const wrapName = (event: string) => process.server ? `[nuxt] ${event}` : event

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.beforeEach(({ name }) => {
    console.time(wrapName(name))
  })

  nuxtApp.hooks.afterEach(({ name, args }) => {
    if (process.client) {
      console.groupCollapsed(name)
      console.timeLog(name, args)
      console.groupEnd()
    }
    if (process.server) {
      console.timeEnd(wrapName(name))
    }
  })
})
