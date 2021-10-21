<template>
  <RouterView v-slot="{ Component }">
    <NuxtLayout v-if="Component" :name="layout || Component.type.layout">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </NuxtLayout>
  </RouterView>
</template>

<script>
import NuxtLayout from './layout'

export default {
  name: 'NuxtChild',
  components: { NuxtLayout },
  props: {
    layout: {
      type: String,
      default: null
    }
  }
}
</script>
