export default defineNuxtRouteMiddleware(async (to) => {
  await new Promise(resolve => setTimeout(resolve, 10))
  setLayout('custom')
})
