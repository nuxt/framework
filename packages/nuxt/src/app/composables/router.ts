import type { Router, RouteLocationNormalizedLoaded, NavigationGuard, RouteLocationNormalized, RouteLocationRaw, NavigationFailure } from 'vue-router'
import { sendRedirect } from 'h3'
import { hasProtocol, joinURL } from 'ufo'
import { useNuxtApp, useRuntimeConfig } from '#app'

export const useRouter = () => {
  return useNuxtApp()?.$router as Router
}

export const useRoute = () => {
  return useNuxtApp()._route as RouteLocationNormalizedLoaded
}

export const useActiveRoute = () => {
  return useNuxtApp()._activeRoute as RouteLocationNormalizedLoaded
}

export interface RouteMiddleware {
  (to: RouteLocationNormalized, from: RouteLocationNormalized): ReturnType<NavigationGuard>
}

export const defineNuxtRouteMiddleware = (middleware: RouteMiddleware) => middleware

export interface AddRouteMiddlewareOptions {
  global?: boolean
}

interface AddRouteMiddleware {
  (name: string, middleware: RouteMiddleware, options?: AddRouteMiddlewareOptions): void
  (middleware: RouteMiddleware): void
}

export const addRouteMiddleware: AddRouteMiddleware = (name: string | RouteMiddleware, middleware?: RouteMiddleware, options: AddRouteMiddlewareOptions = {}) => {
  const nuxtApp = useNuxtApp()
  if (options.global || typeof name === 'function') {
    nuxtApp._middleware.global.push(typeof name === 'function' ? name : middleware)
  } else {
    nuxtApp._middleware.named[name] = middleware
  }
}

const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true
    }
  } catch {
    // Within an async middleware
    return true
  }
  return false
}

export interface NavigateToOptions {
  replace?: boolean
  redirectCode?: number
}

const getPath = (to: RouteLocationRaw): string => {
  if (typeof to === 'string') {
    return to
  }
  if ('path' in to) {
    return to.path
  }
  return '/'
}

export const navigateTo = (to: RouteLocationRaw, options: NavigateToOptions = {}): Promise<void | NavigationFailure> | RouteLocationRaw => {
  if (!to) {
    to = '/'
  }

  const toPath = getPath(to)
  const isExternal = hasProtocol(toPath, true)

  if (!isExternal && isProcessingMiddleware()) {
    return to
  }

  const router = useRouter()
  if (process.server) {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
      const redirectLocation = isExternal ? toPath : joinURL(useRuntimeConfig().app.baseURL, router.resolve(to).fullPath || '/')
      return nuxtApp.callHook('app:redirected').then(() => sendRedirect(nuxtApp.ssrContext.event, redirectLocation, options.redirectCode || 301))
    }
  }
  // Client-side redirection using vue-router
  if (isExternal) {
    if (options.replace) {
      location.replace(toPath)
      return
    }
    location.href = toPath
    return
  }

  return options.replace ? router.replace(to) : router.push(to)
}

/** This will abort navigation within a Nuxt route middleware handler. */
export const abortNavigation = (err?: Error | string) => {
  if (process.dev && !isProcessingMiddleware()) {
    throw new Error('abortNavigation() is only usable inside a route middleware handler.')
  }
  if (err) {
    throw err instanceof Error ? err : new Error(err)
  }
  return false
}
