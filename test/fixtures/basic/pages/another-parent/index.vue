<template>
  <div>
    another-parent/index
  </div>
</template>

<script setup>
await Promise.resolve()
console.log('isHydrating: ' + useNuxtApp().isHydrating)
</script>
