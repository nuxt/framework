<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="html" />
</template>

<script setup lang="ts">
import { error500, errorDev, error404 } from '@nuxt/design'

const props = defineProps({
  error: Object
})

const error = props.error
const is404 = Number(error.statusCode) === 404
const handler = is404 ? error404 : process.dev ? errorDev : error500

// TODO: extract to a separate utility
const stack = (error.stack || '')
  .split('\n')
  .splice(1)
  .map((line) => {
    const text = line
      .replace('webpack:/', '')
      .replace('.vue', '.js') // TODO: Support sourcemap
      .trim()
    return {
      text,
      internal: (line.includes('node_modules') && !line.includes('.cache')) ||
          line.includes('internal') ||
          line.includes('new Promise')
    }
  })

const statusMessage = error.statusMessage ?? error.message ?? error.toString() ?? (is404 ? 'Page Not Found' : 'Internal Server Error')
const description = error.description || (is404
  ? 'Sorry, the page you are looking for could not be found.'
  : process.dev && `
    <h1>${statusMessage}</h1>
    <pre>${stack.map(i => `<span class="stack${i.internal ? ' internal' : ''}">${i.text}</span>`).join('\n')}</pre>
    `)

const html = handler({
  statusMessage,
  description,
  statusCode: error.statusCode || 500
})
</script>
