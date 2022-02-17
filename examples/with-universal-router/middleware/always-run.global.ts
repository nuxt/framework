export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/forbidden') {
    return false
  }
})
