<template>
  <Suspense @resolve="onResolve">
    <App />
  </Suspense>
</template>

<script>
import { onErrorCaptured } from 'vue'
import { useNuxtApp } from '#app'

export default {
  setup () {
    const nuxtApp = useNuxtApp()
    const results = nuxtApp.hooks.callHookWith(hooks => hooks.map(hook => hook()), 'vue:setup')
    if (process.dev && results && results.some(i => i && 'then' in i)) {
      console.error('[nuxt] Error in `vue:setup`. Callbacks must be synchronous.')
    }
    onErrorCaptured((err, target) => {
      const results = nuxtApp.hooks.callHookWith(hooks => hooks.map(hook => hook(err, target)), 'vue:error')
      if (process.dev && results && results.some(i => i && 'then' in i)) {
        console.error('[nuxt] Error in `vue:error`. Callbacks must be synchronous.')
      }
      if (results.includes(false)) {
        // Cancel error propagation
        return false
      }
    })
    return {
      onResolve: () => nuxtApp.callHook('app:suspense:resolve')
    }
  }
}
</script>
