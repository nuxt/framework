<template>
  <Suspense @resolve="onResolve">
    <ErrorComponent v-if="error" :error="error" @errorHandled="clearError" />
    <App v-else />
  </Suspense>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useNuxtApp } from '#app'
// @ts-ignore
import ErrorComponent from '#build/error-component.mjs'

const nuxtApp = useNuxtApp()
const onResolve = () => nuxtApp.callHook('app:suspense:resolve')

// vue:setup hook
const results = nuxtApp.hooks.callHookWith(hooks => hooks.map(hook => hook()), 'vue:setup')
if (process.dev && results && results.some(i => i && 'then' in i)) {
  console.error('[nuxt] Error in `vue:setup`. Callbacks must be synchronous.')
}

// error handling
const error = ref(process.server ? nuxtApp.ssrContext.error : nuxtApp.payload.error)
onErrorCaptured((err, target) => {
  const results = nuxtApp.hooks.callHookWith(hooks => hooks.map(hook => hook(err, target)), 'vue:error')
  if (process.dev && results && results.some(i => i && 'then' in i)) {
    console.error('[nuxt] Error in `vue:error`. Callbacks must be synchronous.')
  }
  if (process.server && nuxtApp.ssrContext) {
    nuxtApp.ssrContext.error = err
  }
  if (process.client) {
    error.value = err
  }
})

async function clearError (redirect?: string) {
  await nuxtApp.callHook('app:error:handled')
  if (redirect) {
    await nuxtApp.$router.replace(redirect)
  }
  error.value = null
}
</script>
