import Vue from 'vue' // eslint-disable-line import/default
import VueCompositionAPI from '@vue/composition-api'
import { defineNuxtPlugin } from '#app'

Vue.use(VueCompositionAPI.default || VueCompositionAPI)

export default defineNuxtPlugin((nuxtApp) => {
  const _originalSetup = nuxtApp.nuxt2Context.app.setup

  nuxtApp.nuxt2Context.app.setup = function (...args) {
    const result = _originalSetup instanceof Function ? _originalSetup(...args) : {}
    nuxtApp.callHook('vue:setup')
    return result
  }
})
