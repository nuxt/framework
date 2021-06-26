<template>
  <RouterView v-slot="{ Component }">
    <NuxtLayout :layout="forcedUpdate || Component.type.layout">
      <transition name="page" mode="out-in">
        <!-- <keep-alive> -->
        <Suspense @pending="$nuxt.callHook('page:start', Component)" @resolve="$nuxt.callHook('page:finish', Component)">
          <component :is="Component" :key="$route.path" />
        </Suspense>
        <!-- <keep-alive -->
      </transition>
    </NuxtLayout>
  </RouterView>
</template>

<script>
import NuxtLayout from './layout'

export default {
  name: 'NuxtPage',
  components: { NuxtLayout },
  data: () => ({
    forcedUpdate: null
  }),
  created () {
    if (process.dev && process.client) {
      this.$nuxt.hook('page:start', (Component) => {
        this.forcedUpdate = Component.type.layout
      })
    }
  }
}
</script>
