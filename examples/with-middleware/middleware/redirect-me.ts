export default defineNuxtMiddleware((_to, _from, next) => {
  const { $config } = useNuxtApp()
  if ($config) {
    console.log('Accessed runtime config within middleware.')
  }
  next('/secret')
})
