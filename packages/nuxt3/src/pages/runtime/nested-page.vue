<template>
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="getKey(pageKey, route, Component)" />
  </RouterView>
</template>

<script lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { getKey } from './utils'

export default {
  name: 'NuxtNestedPage',
  props: {
    pageKey: {
      type: [Function, String] as unknown as () => string | ((route: RouteLocationNormalizedLoaded) => string),
      default: null
    }
  },
  setup () {
    return {
      getKey
    }
  }
}
</script>
