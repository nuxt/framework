<script setup lang="ts">
const { document, type } = useContentDocument()
</script>

<template>
  <ContentRendererMarkdown v-if="type === 'markdown'" :document="document" />
  <ContentRendererYaml v-else-if="type === 'yaml'" :document="document" />
</template>
