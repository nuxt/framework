<template>
  <div>SYNC</div>
</template>

<script setup>
console.log('SYNC')
const a = useNuxtApp()
console.log('Hydrating In SYNC ' + a.isHydrating)
</script>
