import { defineNuxtRouteMiddleware } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.meta?.validate) { return }

  const result = await Promise.resolve(to.meta.validate(to))
  if (result === true) {
    return
  }
  return result
})
