import { defineNuxtPlugin, loadPayload, addRouteMiddleware, isPrerender } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  if (!isPrerender()) {
    return // TODO: Watch for mode change in hybrid mode
  }
  addRouteMiddleware(async (to, from) => {
    if (to.path === from.path) { return }
    const url = to.path
    const payload = await loadPayload(url)
    Object.assign(nuxtApp.payload.data, payload.data)
  })
})
