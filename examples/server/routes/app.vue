<template>
  <NuxtExampleLayout example="server/routes">
    <p>Fetched from <pre>/api/mountain</pre>: {{ mountain }}</p>
  </NuxtExampleLayout>
</template>

<script setup>
const { data: mountain } = await useAsyncData('mountain', () => $fetch('/api/mountain').catch(console.trace))
</script>
