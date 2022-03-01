<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="html" />
</template>

<script setup lang="ts">
import { error500, errorDev, error404 } from '@nuxt/design'

const props = defineProps({
  errors: Array
})

const err = props.errors[0] as any
const handler = err.statusCode === 404 ? error404 : process.dev ? errorDev : error500
const html = handler({
  description: err.message,
  statusCode: err.statusCode || 500
})
</script>
