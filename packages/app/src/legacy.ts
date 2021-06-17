import type { IncomingMessage, ServerResponse } from 'http'
import type { NuxtOptions } from '@nuxt/kit'
import type { Component } from '@vue/runtime-core'
import mockContext from 'unenv/runtime/mock/proxy'
import { Nuxt } from './nuxt'

type Route = any
type Store = any

export interface LegacyContext {
  // -> $config
  $config: Record<string, any>
  env: Record<string, any>
  // -> app
  app: Component
  // -> deprecated
  isClient: boolean
  isServer: boolean
  isStatic: boolean
  // TODO: needs app implementation
  isDev: boolean
  isHMR: boolean
  // -> deprecated
  store: Store
  // vue-router integration
  route: Route
  params: Route['params']
  query: Route['query']
  base: string /** TODO: */
  payload: any /** TODO: */
  from: Route /** TODO: */
  // -> nuxt.payload.data
  nuxtState: Record<string, any>
  // TODO: needs app implementation
  beforeNuxtRender (fn: (params: { Components: any, nuxtState: Record<string, any> }) => void): void
  beforeSerialize (fn: (nuxtState: Record<string, any>) => void): void
  // TODO: needs app implementation
  enablePreview?: (previewData?: Record<string, any>) => void
  $preview?: Record<string, any>
  // -> ssrContext.{req,res}
  req: IncomingMessage
  res: ServerResponse
  /** TODO: */
  next?: (err?: any) => any
  error (params: any): void
  redirect (status: number, path: string, query?: Route['query']): void
  redirect (path: string, query?: Route['query']): void
  redirect (location: Location): void
  redirect (status: number, location: Location): void
  ssrContext?: {
    // -> ssrContext.{req,res,url,runtimeConfig}
    req: LegacyContext['req']
    res: LegacyContext['res']
    url: string
    runtimeConfig: {
      public: Record<string, any>
      private: Record<string, any>
    }
    // -> deprecated
    target: NuxtOptions['target']
    spa?: boolean
    modern: boolean
    fetchCounters: Record<string, number>
    // TODO:
    next: LegacyContext['next']
    redirected: boolean
    beforeRenderFns: Array<() => any>
    beforeSerializeFns: Array<() => any>
    // -> nuxt.payload
    nuxt: {
      serverRendered: boolean
      // TODO:
      layout: string
      data: Array<Record<string, any>>
      fetch: Array<Record<string, any>>
      error: any
      state: Array<Record<string, any>>
      routePath: string
      config: Record<string, any>
    }
  }
}

function mock (warning: string) {
  console.warn(warning)
  return mockContext
}

const unsupported = new Set<keyof LegacyContext | keyof LegacyContext['ssrContext']>([
  'isClient',
  'isServer',
  'isStatic',
  'store',
  'target',
  'spa',
  'env',
  'modern',
  'fetchCounters'
])

const todo = new Set<keyof LegacyContext | keyof LegacyContext['ssrContext']>([
  'isDev',
  'isHMR',
  // Routing handlers - needs implementation or deprecation
  'base',
  'payload',
  'from',
  'next',
  'error',
  'redirect',
  'redirected',
  // needs app implementation
  'enablePreview',
  '$preview',
  'beforeNuxtRender',
  'beforeSerialize'
])

const routerKeys: Array<keyof LegacyContext | keyof LegacyContext['ssrContext']> = ['route', 'params', 'query']

export function getLegacyContext (nuxt: Nuxt) {
  if (nuxt._legacyContext) {
    return nuxt._legacyContext
  }

  nuxt._legacyContext = new Proxy(nuxt, {
    get (nuxt, p: keyof LegacyContext | keyof LegacyContext['ssrContext']) {
      // Deprecated keys
      if (unsupported.has(p)) {
        return mock(`Accessing ${p} is not supported in Nuxt3.`)
      }

      if (todo.has(p)) {
        return mock(`Accessing ${p} is not yet supported in Nuxt3.`)
      }

      // vue-router implementation
      if (routerKeys.includes(p)) {
        if (!('$router' in nuxt)) {
          return mock('vue-router is not being used in this project.')
        }
        switch (p) {
          case 'route':
            return nuxt.$router.currentRoute.value
          case 'params':
          case 'query':
            return nuxt.$router.currentRoute.value[p]
        }
      }

      if (p === '$config') {
        // TODO: needs implementation
        return mock('Accessing runtime config is not yet supported in Nuxt3.')
      }

      if (p === 'ssrContext') {
        return nuxt._legacyContext
      }

      if (p in nuxt.ssrContext) {
        return nuxt.ssrContext[p]
      }

      if (p === 'nuxt') {
        return nuxt.payload
      }

      if (p === 'nuxtState') {
        return nuxt.payload.data
      }

      if (p in nuxt.app) {
        return nuxt.app[p]
      }

      if (p in nuxt) {
        return nuxt[p]
      }

      return mock(`Accessing ${p} is not supported in Nuxt3.`)
    }
  }) as unknown as LegacyContext

  return nuxt._legacyContext
}
