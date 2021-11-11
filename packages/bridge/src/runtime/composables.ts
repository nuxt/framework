/* eslint-disable no-redeclare */
import { reactive, toRef, isReactive, Ref } from '@vue/composition-api'
import type VueRouter from 'vue-router'
import type { Route } from 'vue-router'
import { useNuxtApp } from './app'

export * from '@vue/composition-api'

const mock = () => () => { throw new Error('not implemented') }

export const useAsyncData = mock()
export const useHydration = mock()

// Runtime config helper
export const useRuntimeConfig = () => {
  const nuxtApp = useNuxtApp()
  if (!nuxtApp.$config) {
    nuxtApp.$config = reactive(nuxtApp.nuxt2Context.app.$config)
  }
  return nuxtApp.$config
}

// Auto-import equivalents for `vue-router`
export const useRouter = () => {
  return useNuxtApp()?.nuxt2Context.app.router as VueRouter
}

// This provides an equivalent interface to `vue-router` (unlike legacy implementation)
export const useRoute = () => {
  const nuxtApp = useNuxtApp()

  if (!nuxtApp._route) {
    Object.defineProperty(nuxtApp, '__route', {
      get: () => nuxtApp.nuxt2Context.app.context.route
    })
    nuxtApp._route = reactive(nuxtApp.__route)
    const router = useRouter()
    router.afterEach(route => Object.assign(nuxtApp._route, route))
  }

  return nuxtApp._route as Route
}

const stateSymbol = Symbol('nuxt-states')

export interface NuxtStates { }
export type StateKey<T> = string & { [stateSymbol]: T }

/** Return a typed string that can be used as a key for `useState`. */
export const stateKey = <T> (k: string) => k as StateKey<T>

// payload.state is used for vuex by nuxt 2
export function useState<T = unknown, K extends string = string, S = K extends keyof NuxtStates ? NuxtStates[K] : T> (key: K | StateKey<T>): Ref<S | undefined>
export function useState<T = unknown, K extends string = string, S = K extends keyof NuxtStates ? NuxtStates[K] : T> (key: K | StateKey<T>, init: (() => S)): Ref<S>
export function useState (key: string, init?: (() => any)): Ref<any> {
  const nuxtApp = useNuxtApp()
  if (!nuxtApp.payload.useState) {
    nuxtApp.payload.useState = {}
  }
  if (!isReactive(nuxtApp.payload.useState)) {
    nuxtApp.payload.useState = reactive(nuxtApp.payload.useState)
  }
  const state = toRef(nuxtApp.payload.useState, key)
  if (state.value === undefined && init) {
    state.value = init()
  }
  return state
}
