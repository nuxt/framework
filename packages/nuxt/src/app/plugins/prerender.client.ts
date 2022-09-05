import { defineNuxtPlugin, loadPayload, addRouteMiddleware, isPrerendered } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  if (!isPrerendered()) {
    return // TODO: Watch for mode change in hybrid mode
  }
  addRouteMiddleware(async (to, from) => {
    if (to.path === from.path) { return }
    const url = to.path
    const payload = await loadPayload(url)
    Object.assign(nuxtApp.payload.data, payload.data)
  })
})
