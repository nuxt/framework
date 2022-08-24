export default defineNuxtRouteMiddleware((to, from) => {
  let layoutValue = setLayout()
  layoutValue.value = 'test'
})
