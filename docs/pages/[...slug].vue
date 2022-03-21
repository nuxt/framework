<template>
  <div class="prose dark:prose-invert !max-w-full">
    <Content v-if="page && page.id" :id="page.id" class="" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['page', 'navigation', 'document']
})

const route = useRoute()

const { findOne } = useContentQuery(route.path)

const { data: page } = await useAsyncData('docs-page-content', findOne)
</script>
