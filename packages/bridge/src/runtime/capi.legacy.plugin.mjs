import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxt) => {
  nuxt._setupFns = []

  const { setup } = nuxt.legacyNuxt

  nuxt.legacyNuxt.setup = function (...args) {
    const result = setup instanceof Function ? setup(...args) : {}
    for (const fn of nuxt._setupFns) {
      Object.assign(result, fn.call(this, ...args))
    }
    return result
  }
})
