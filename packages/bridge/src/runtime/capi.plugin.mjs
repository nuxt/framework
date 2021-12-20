import Vue from 'vue' // eslint-disable-line import/default
import VueCompositionAPI from '@vue/composition-api'
import { defineNuxtPlugin } from '#app'

Vue.use(VueCompositionAPI.default || VueCompositionAPI)

export default defineNuxtPlugin((nuxtApp) => {
  const _originalSetup = nuxtApp.nuxt2Context.app.setup

  nuxtApp.nuxt2Context.app.setup = function (...args) {
    const result = _originalSetup instanceof Function ? _originalSetup(...args) : {}

    const hooks = nuxtApp.hooks._hooks['vue:setup']
    if (hooks) {
      const hookResult = hooks.map(hook => hook())
      if (process.dev && hookResult && hookResult.some(i => i && 'then' in i)) {
        console.error('[nuxt] Error in `vue:setup`. Callbacks must be synchronous.')
      }
    }

    return result
  }
})
