<template>
  <Suspense>
    <App />
  </Suspense>
</template>

<script>
import { useNuxtApp } from '#app'

export default {
  setup () {
    const results = useNuxtApp().hooks.callHookWith(hooks => hooks.map(hook => hook()), 'vue:setup')
    if (process.dev && results && results.some(i => i && 'then' in i)) {
      console.error('[nuxt] Error in `vue:setup`. Callbacks must be synchronous.')
    }
  }
}
</script>
