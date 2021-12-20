<template>
  <Suspense>
    <App />
  </Suspense>
</template>

<script>
import { useNuxtApp } from '#app'

export default {
  setup () {
    const hooks = useNuxtApp().hooks._hooks['vue:setup']
    if (!hooks) { return }
    const results = hooks.map(hook => hook())
    if (process.dev && results && results.some(i => i && 'then' in i)) {
      console.error('[nuxt] Error in `vue:setup`. Callbacks must be synchronous.')
    }
  }
}
</script>
