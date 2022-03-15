<script setup>
const route = useRoute()
console.log(route.path)
const slug = computed(() => route.path.slice(1))
const isMountain = computed(() => ['mount-everest', 'aconcagua'].includes(slug.value))

// Needed to let Nuxt know hydration is done
const nuxtApp = useNuxtApp()

const onPending = () => console.log('Suspense pending')
const onFallback = () => console.log('Suspense fallback')
const onResolve = () => {
  console.log('Suspense resolve')
  nuxtApp.hooks.callHook('app:suspense:resolve')
}
</script>

<template>
  <div>
    <Navbar />
    <Suspense @pending="onPending" @resolve="onResolve">
      <Mountain v-if="isMountain" :key="slug" :slug="slug" />
      <h1 v-else>
        Home
      </h1>
    </Suspense>
  </div>
</template>

<style>
body {
  background-color: aquamarine;
  font-family: sans-serif;
}
</style>
