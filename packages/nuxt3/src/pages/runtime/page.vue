<template>
  <RouterView v-slot="{ Component, route }">
    <NuxtLayout v-if="Component" :name="layout || route.meta.layout">
      <transition v-bind="route.meta.transition || { name: 'page', mode: 'out-in' }">
        <!-- <keep-alive> -->
        <Suspense @pending="() => onSuspensePending(Component)" @resolve="() => onSuspenseResolved(Component)">
          <component :is="Component" :key="$route.path" />
        </Suspense>
        <!-- <keep-alive -->
      </transition>
    </NuxtLayout>
    <!-- TODO: Handle 404 placeholder -->
  </RouterView>
</template>

<script>
import NuxtLayout from './layout'
import { useNuxtApp } from '#app'

export default {
  name: 'NuxtPage',
  components: { NuxtLayout },
  props: {
    layout: {
      type: String,
      default: null
    }
  },
  setup () {
    const nuxtApp = useNuxtApp()

    function onSuspensePending (Component) {
      return nuxtApp.callHook('page:start', Component)
    }

    function onSuspenseResolved (Component) {
      return nuxtApp.callHook('page:finish', Component)
    }

    return {
      onSuspensePending,
      onSuspenseResolved
    }
  }
}
</script>
