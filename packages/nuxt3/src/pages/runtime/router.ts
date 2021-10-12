import { shallowRef } from 'vue'
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
  RouterLink
} from 'vue-router'
// @ts-ignore
import NuxtPage from './page.vue'
import NuxtLayout from './layout'
import { defineNuxtPlugin, useNuxtErrors } from '#app'
// @ts-ignore
import routes from '#build/routes'

export default defineNuxtPlugin((nuxt) => {
  const { app } = nuxt

  app.component('NuxtPage', NuxtPage)
  app.component('NuxtLayout', NuxtLayout)
  app.component('NuxtLink', RouterLink)

  const routerHistory = process.client
    ? createWebHistory()
    : createMemoryHistory()

  const router = createRouter({
    history: routerHistory,
    routes
  })
  app.use(router)
  nuxt.provide('router', router)

  const previousRoute = shallowRef(router.currentRoute.value)
  router.afterEach((_to, from) => {
    previousRoute.value = from
  })

  Object.defineProperty(app.config.globalProperties, 'previousRoute', {
    get: () => previousRoute.value
  })

  const { addError, resetErrors } = useNuxtErrors()

  function handle404 (url: string) {
    const error = new Error(`Page not found: ${url}`)
    // @ts-ignore
    error.statusCode = 404
    addError(error)
  }

  nuxt.hook('app:mounted', () => {
    router.beforeEach((to) => {
      // Clear error on navigation
      resetErrors()
      if (to.matched.length === 0) {
        handle404(to.fullPath)
      }
    })
  })

  nuxt.hook('app:created', async () => {
    if (process.server) {
      router.push(nuxt.ssrContext.url)
    }

    await router.isReady()

    const is404 = router.currentRoute.value.matched.length === 0
    if (process.server && is404 && !nuxt.ssrContext.errors.length) {
      handle404(nuxt.ssrContext.url)
    }
  })
})
