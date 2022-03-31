<script setup lang="ts">
await useFetch('http://icanhazip.com', { key: 'test' })
await useFetch('http://icanhazip.com', { key: 'test', server: false, initialCache: false })
</script>

<template>
  <!-- Edit this file to play around with Nuxt but never commit changes! -->
  <div>
    Nuxt 3 Playground
  </div>
</template>

<style scoped>
</style>
