<template>
  <ULink
    :to="link.to"
    class="u-text-gray-500 hover:u-text-gray-900"
    active-class="font-semibold u-text-gray-900"
    inactive-class="font-medium"
    exact
  >
    <span class="inline-block py-1">
      {{ link.label }}
    </span>
  </ULink>
</template>

<script setup lang="ts">
defineProps({
  link: {
    type: Object,
    required: true
  }
})
</script>
