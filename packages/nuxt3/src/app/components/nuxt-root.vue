<template>
  <Suspense @pending="onPending" @resolve="onResolve">
    <App />
  </Suspense>
</template>

<script>
import { useNuxtApp } from '#app'

export default {
  setup () {
    const nuxtApp = useNuxtApp()
    const results = nuxtApp.hooks.callHookWith(hooks => hooks.map(hook => hook()), 'vue:setup')
    if (process.dev && results && results.some(i => i && 'then' in i)) {
      console.error('[nuxt] Error in `vue:setup`. Callbacks must be synchronous.')
    }
    return {
      onPending: () => nuxtApp.callHook('app:start'),
      onResolve: () => nuxtApp.callHook('app:finish')
    }
  }
}
</script>
