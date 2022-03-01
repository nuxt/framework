<template>
  <Suspense @resolve="onResolve">
    <ErrorComponent v-if="errors.length" :errors="errors" @errorHandled="clearErrors" />
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
const errors = ref(process.server ? nuxtApp.ssrContext.errors : window.__NUXT__.errors)
onErrorCaptured((err, target) => {
  const results = nuxtApp.hooks.callHookWith(hooks => hooks.map(hook => hook(err, target)), 'vue:error')
  if (process.dev && results && results.some(i => i && 'then' in i)) {
    console.error('[nuxt] Error in `vue:error`. Callbacks must be synchronous.')
  }
  if (process.server && nuxtApp.ssrContext) {
    nuxtApp.ssrContext.errors.push(err)
  }
  if (process.client) {
    errors.value.push(err)
  }
})

async function clearErrors (redirect?: string) {
  await nuxtApp.callHook('app:error:handled')
  if (redirect) {
    await nuxtApp.$router.replace(redirect)
  }
  errors.value = []
}
</script>
