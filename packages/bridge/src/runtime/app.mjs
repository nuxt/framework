import { defineComponent, getCurrentInstance } from './composables.mjs'

export const defineNuxtComponent = defineComponent

let currentNuxtInstance

export const setNuxtInstance = (nuxt) => {
  currentNuxtInstance = nuxt
}

export const defineNuxtPlugin = plugin => (ctx) => {
  setNuxtInstance(ctx.$_nuxtApp)
  plugin(ctx.$_nuxtApp)
  setNuxtInstance(null)
}

export const useNuxtApp = () => {
  const vm = getCurrentInstance()

  if (!vm) {
    if (!currentNuxtInstance) {
      throw new Error('nuxt instance unavailable')
    }
    return currentNuxtInstance
  }

  return vm?.proxy.$_nuxtApp
}
