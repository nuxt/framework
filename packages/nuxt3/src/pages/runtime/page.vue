<template>
  <RouterView v-slot="{ Component }">
    <Suspense v-if="unhandledErrors.length" :key="$route.fullPath" @pending="() => onSuspensePending()" @resolve="() => onSuspenseResolved()">
      <ErrorPage :errors="unhandledErrors" />
    </Suspense>
    <NuxtLayout v-else-if="Component" :name="layout || updatedComponentLayout || Component.type.layout">
      <transition name="page" mode="out-in">
        <!-- <keep-alive> -->
        <Suspense @pending="() => onSuspensePending(Component)" @resolve="() => onSuspenseResolved(Component)">
          <component :is="Component" :key="$route.path" />
        </Suspense>
        <!-- <keep-alive -->
      </transition>
    </NuxtLayout>
  </RouterView>
</template>

<script>
import { ref } from 'vue'

import NuxtLayout from './layout'
import ErrorPage from '#build/error'
import { useNuxtErrors } from '#app/composables/errors'
import { useNuxtApp } from '#app'

export default {
  name: 'NuxtPage',
  components: { ErrorPage, NuxtLayout },
  props: {
    layout: {
      type: String,
      default: null
    }
  },
  setup () {
    // Disable HMR reactivity in production
    const updatedComponentLayout = process.dev ? ref(null) : null

    const nuxt = useNuxtApp()

    function onSuspensePending (Component) {
      if (process.dev) {
        updatedComponentLayout.value = Component?.type?.layout || null
      }
      return nuxt.callHook('page:start', Component)
    }

    function onSuspenseResolved (Component) {
      return nuxt.callHook('page:finish', Component)
    }

    const { unhandledErrors, addError } = useNuxtErrors()

    onErrorCaptured((e) => {
      addError(e)
      return false
    })

    return {
      unhandledErrors,
      updatedComponentLayout,
      onSuspensePending,
      onSuspenseResolved
    }
  }
}
</script>
