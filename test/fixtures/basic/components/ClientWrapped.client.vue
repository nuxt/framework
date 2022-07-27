<script setup lang="ts">
function exposedFunc () {
  console.log('ok')
}

defineExpose({ exposedFunc })
</script>

<template>
  <div>
    client-only component
  </div>
</template>
