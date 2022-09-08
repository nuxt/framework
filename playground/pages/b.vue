<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
console.log('B')
const a = useNuxtApp()
console.log('Hydrating In B ' + a.isHydrating)
</script>
