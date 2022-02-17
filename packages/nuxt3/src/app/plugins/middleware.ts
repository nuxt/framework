import { reactive } from 'vue'
import type { NavigationGuard } from 'vue-router'
import { createError } from 'h3'
import { callWithNuxt, defineNuxtPlugin, NuxtApp, useRouter } from '#app'
// @ts-ignore
import { globalMiddleware, namedMiddleware } from '#build/middleware'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  nuxtApp._middleware = nuxtApp._middleware || {
    global: [],
    named: {}
  }

  router.beforeEach(async (to, from) => {
    to.meta = reactive(to.meta || {})
    nuxtApp._processingMiddleware = true

    type MiddlewareDef = string | NavigationGuard
    const middlewareEntries = new Set<MiddlewareDef>([...globalMiddleware, ...nuxtApp._middleware.global])
    for (const component of to.matched) {
      const componentMiddleware = component.meta.middleware as MiddlewareDef | MiddlewareDef[]
      if (!componentMiddleware) { continue }
      if (Array.isArray(componentMiddleware)) {
        for (const entry of componentMiddleware) {
          middlewareEntries.add(entry)
        }
      } else {
        middlewareEntries.add(componentMiddleware)
      }
    }

    for (const entry of middlewareEntries) {
      const middleware = typeof entry === 'string' ? nuxtApp._middleware.named[entry] || await namedMiddleware[entry]?.().then(r => r.default || r) : entry

      if (process.dev && !middleware) {
        console.warn(`Unknown middleware: ${entry}. Valid options are ${Object.keys(namedMiddleware).join(', ')}.`)
      }

      const result = await callWithNuxt(nuxtApp as NuxtApp, middleware, [to, from])
      if (process.server) {
        if (result === false || result instanceof Error) {
          const error = result || createError({
            statusMessage: `Route navigation aborted: ${nuxtApp.ssrContext.url}`
          })
          nuxtApp.ssrContext.error = error
          throw error
        }
      }
      if (result || result === false) { return result }
    }
  })

  router.afterEach(() => {
    delete nuxtApp._processingMiddleware
  })
})
