<script setup lang="ts">
</script>

<template>
  <!-- Edit this file to play around with Nuxt but never commit changes! -->
  <div>
    Nuxt 3 Playground
  </div>
</template>

<script setup>
const $router = useRouter()
$router.push({
  path: '/hello',
  query: {
    name: 'John Doe'
  },
  hash: '#hash'
})
</script>
