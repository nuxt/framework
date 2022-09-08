<template>
  <div>B1</div>
</template>
<script setup>
await Promise.resolve()
console.log('B1(ASYNC)')
const a = useNuxtApp()
console.log('Hydrating In B1 ' + a.isHydrating)
</script>
