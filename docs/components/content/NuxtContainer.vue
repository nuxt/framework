<template>
  <Component :is="tag" class="relative w-full d-container-content">
    <slot />
  </Component>
</template>

<script setup lang="ts">
defineProps({
  tag: {
    type: String,
    default: 'div'
  }
})
</script>
