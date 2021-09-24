import { getCurrentInstance } from './composables.mjs'

const mock = () => () => { throw new Error('not implemented') }

export const defineNuxtPlugin = mock()
export const defineNuxtComponent = mock()
export const useNuxtApp = () => {
  const vm = getCurrentInstance()

  if (!vm) {
    throw new Error('nuxt instance unavailable')
  }

  return vm?.proxy.$_nuxtApp
}
