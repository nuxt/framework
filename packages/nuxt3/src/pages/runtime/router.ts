import { computed, reactive, shallowRef } from 'vue'
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
  RouterLink,
  NavigationGuard
} from 'vue-router'
import NuxtNestedPage from './nested-page.vue'
import NuxtPage from './page.vue'
import NuxtLayout from './layout'
import { callWithNuxt, defineNuxtPlugin, useRuntimeConfig } from '#app'
// @ts-ignore
import routes from '#build/routes'
// @ts-ignore
import middleware from '#build/middleware'

declare module 'vue' {
  export interface GlobalComponents {
    NuxtNestedPage: typeof NuxtNestedPage
    NuxtPage: typeof NuxtPage
    NuxtLayout: typeof NuxtLayout
    NuxtLink: typeof RouterLink
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('NuxtNestedPage', NuxtNestedPage)
  nuxtApp.vueApp.component('NuxtPage', NuxtPage)
  nuxtApp.vueApp.component('NuxtLayout', NuxtLayout)
  nuxtApp.vueApp.component('NuxtLink', RouterLink)
  // TODO: remove before release - present for backwards compatibility & intentionally undocumented
  nuxtApp.vueApp.component('NuxtChild', NuxtNestedPage)

  const { baseURL } = useRuntimeConfig().app
  const routerHistory = process.client
    ? createWebHistory(baseURL)
    : createMemoryHistory(baseURL)

  const router = createRouter({
    history: routerHistory,
    routes
  })
  nuxtApp.vueApp.use(router)

  const previousRoute = shallowRef(router.currentRoute.value)
  router.afterEach((_to, from) => {
    previousRoute.value = from
  })

  Object.defineProperty(nuxtApp.vueApp.config.globalProperties, 'previousRoute', {
    get: () => previousRoute.value
  })

  // https://github.com/vuejs/vue-router-next/blob/master/src/router.ts#L1192-L1200
  const route = {}
  for (const key in router.currentRoute.value) {
    route[key] = computed(() => router.currentRoute.value[key])
  }

  nuxtApp._route = reactive(route)

  router.beforeEach(async (to, from, next) => {
    if (!to.meta.middleware) {
      return next()
    }

    const guards = to.matched.reduce((mw, component) => {
      if (!component.meta.middleware) { return mw }

      if (Array.isArray(component.meta.middleware)) {
        for (const guard of middleware) {
          mw.add(guard)
        }
      } else {
        mw.add(component.meta.middleware)
      }
      return mw
    }, new Set<string | NavigationGuard>())

    let nextCalledWith: any
    for (const guard of guards) {
      const mw = typeof guard === 'string' ? await middleware[guard]?.().then(r => r.default || r) : guard
      if (process.dev && !mw) {
        console.warn(`Unknown middleware: ${guard}. Valid options are ${Object.keys(middleware).join(', ')}.`)
      }
      await callWithNuxt(nuxtApp, () => mw?.(to, from, (arg?: any) => { nextCalledWith = arg }))

      // Short circuit the rest of the guards if next() is called with a value
      if (nextCalledWith !== undefined) { return next(nextCalledWith) }
    }

    next()
  })

  nuxtApp.hook('app:created', async () => {
    if (process.server) {
      router.push(nuxtApp.ssrContext.url)

      router.afterEach((to) => {
        if (to.fullPath !== nuxtApp.ssrContext.url) {
          nuxtApp.ssrContext.res.setHeader('Location', to.fullPath)
        }
      })
    }

    await router.isReady()

    const is404 = router.currentRoute.value.matched.length === 0
    if (process.server && is404) {
      const error = new Error(`Page not found: ${nuxtApp.ssrContext.url}`)
      // @ts-ignore
      error.statusCode = 404
      nuxtApp.ssrContext.error = error
    }
  })

  return { provide: { router } }
})
