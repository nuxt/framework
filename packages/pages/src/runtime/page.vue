<template>
  <RouterView v-slot="{ Component }">
    <NuxtLayout :layout="Component.type.layout">
      <transition name="page" mode="out-in">
        <!-- <keep-alive> -->
        <Suspense @pending="$nuxt.callHook('page:start')" @resolve="$nuxt.callHook('page:finish')">
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
  components: { NuxtLayout }
}
</script>
