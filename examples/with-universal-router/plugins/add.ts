export default defineNuxtPlugin(() => {
  addRouteMiddleware('forbidden', (to) => {
    if (to.path === '/forbidden') {
      return false
    }
  }, { global: true })

  addRouteMiddleware('redirect', (to) => {
    const { $config } = useNuxtApp()
    if ($config) {
      console.log('Accessed runtime config within middleware.')
    }

    if (to.path !== '/redirect') { return }

    console.log('Heading to', to.path, 'but I think we should go somewhere else...')
    return '/secret'
  }, { global: true })
})
