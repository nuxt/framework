<script setup>import { useNuxt } from '~~/../../packages/kit/src'

const route = useRoute()
const nuxtApp = useNuxtApp()
const { data: mountain, error } = await useFetch(() =>`https://api.nuxtjs.dev/mountains/${route.nextPath.slice(1)}`)
const classes = computed(() => {
  if (mountain.value.slug === 'mount-everest') {
    return 'bg-white'
  }
  return 'bg-black text-white'
})
nuxtApp.hook('app:suspense:resolve', () => {
  console.log('[app:suspense:resolve]', route.path)
})
nuxtApp.hook('app:suspense:pending', () => {
  console.log('[app:suspense:pending]', route.path)
})
</script>

<template>
  <pre v-if="error">{{ error.message }}</pre>
  <div v-else class="p-4 transition-all duration-300" :class="classes">
    <h1 class="text-3xl mb-2">
      {{ mountain.title }}
    </h1>
    <pre class="border-gray-400 border transition p-4 transition-1000 transition-all overflow-auto rounded">{{ mountain }}</pre>
  </div>
</template>
