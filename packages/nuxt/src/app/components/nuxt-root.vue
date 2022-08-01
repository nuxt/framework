<template>
  <Suspense @resolve="onResolve">
    <ErrorComponent v-if="error" :error="error" />
    <RenderComponents v-else-if="componentsToRender" :components="componentsToRender" />
    <App v-else />
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent, onErrorCaptured } from 'vue'
import { callWithNuxt, isNuxtError, showError, useError, useNuxtApp } from '#app'

const ErrorComponent = defineAsyncComponent(() => import('#build/error-component.mjs'))
const RenderComponents = process.server
  ? defineAsyncComponent(() => import('./render-components').then(r => r.default || r))
  // Generate client-side CSS chunks - TODO: https://github.com/nuxt/framework/pull/5688
  : () => import('#build/components-islands.mjs')

const nuxtApp = useNuxtApp()
const onResolve = () => nuxtApp.callHook('app:suspense:resolve')

// vue:setup hook
const results = nuxtApp.hooks.callHookWith(hooks => hooks.map(hook => hook()), 'vue:setup')
if (process.dev && results && results.some(i => i && 'then' in i)) {
  console.error('[nuxt] Error in `vue:setup`. Callbacks must be synchronous.')
}

// error handling
const error = useError()
onErrorCaptured((err, target, info) => {
  nuxtApp.hooks.callHook('vue:error', err, target, info).catch(hookError => console.error('[nuxt] Error in `vue:error` hook', hookError))
  if (process.server || (isNuxtError(err) && (err.fatal || err.unhandled))) {
    callWithNuxt(nuxtApp, showError, [err])
  }
})

// server component rendering
const componentsToRender = process.server && nuxtApp.ssrContext?.render?.components
</script>
