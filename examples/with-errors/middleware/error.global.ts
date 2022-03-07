export default defineNuxtRouteMiddleware((to) => {
  if ('middleware' in to.query) {
    throwError('error in middleware')
  }
})
