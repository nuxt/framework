export default defineNuxtPlugin(({ $router }) => {
  $router.addRoute({
    path: '/about',
    component: () => import('~/areas/about/pages/about.vue')
  })
})
