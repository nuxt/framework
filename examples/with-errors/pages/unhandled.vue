<template>
  <main>
    <h2>Unhandled error</h2>
    {{ data }}
  </main>
</template>

<script setup lang="ts">
const { data } = await useAsyncData('error-async-unhandled' + Math.random(), async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  throw new Error('Throwing this error just because I can.')
})
</script>
