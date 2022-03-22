<template>
  <div class="prose dark:prose-invert !max-w-full">
    <Content />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['page', 'navigation', 'document']
})
</script>
