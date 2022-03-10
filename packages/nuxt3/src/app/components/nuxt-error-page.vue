<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="html" />
</template>

<script setup lang="ts">
import { error500, errorDev, error404 } from '@nuxt/design'

const props = defineProps({
  error: Object
})

const err = props.error
const is404 = Number(err.statusCode) === 404
const handler = is404 ? error404 : process.dev ? errorDev : error500
const html = handler({
  statusMessage: err.statusMessage,
  description: err.description || (is404 ? 'Sorry, the page you are looking for could not be found.' : undefined),
  statusCode: err.statusCode
})
</script>
