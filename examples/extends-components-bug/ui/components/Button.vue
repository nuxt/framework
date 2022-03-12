<script setup>
defineProps({
  color: {
    type: String,
    default: 'black'
  }
})
</script>

<template>
  <button :style="{ color }">
    <slot />
  </button>
</template>
