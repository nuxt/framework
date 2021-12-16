<template>
  <Suspense>
    <App />
  </Suspense>
</template>

<script>
import { useNuxtApp } from '#app'

export default {
  setup () {
    useNuxtApp().callHook('vue:setup')
  }
}
</script>
