<template>
  <div>A</div>
</template>

<script setup>
await Promise.resolve()
console.log('A(ASYNC)')
const a = useNuxtApp()
console.log('Hydrating In A ' + a.isHydrating)
</script>
