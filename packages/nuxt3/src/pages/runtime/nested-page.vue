<template>
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="getKeyFor(childKey || route.meta.key, route)" />
  </RouterView>
</template>

<script lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const getKeyFor = (key: string | ((route: RouteLocationNormalizedLoaded) => string), route?: RouteLocationNormalizedLoaded) => {
  return key && typeof key === 'function' ? key(route) : key
}

export default {
  name: 'NuxtNestedPage',
  props: {
    childKey: {
      type: [Function, String] as unknown as () => string | ((route: RouteLocationNormalizedLoaded) => string),
      default: null
    }
  },
  setup () {
    return { getKeyFor }
  }
}
</script>
