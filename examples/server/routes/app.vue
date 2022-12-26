<template>
  <NuxtExampleLayout example="server/routes">
    <p>Fetched from <pre>/api/mountain</pre>: {{ mountain }}</p>
  </NuxtExampleLayout>
</template>

<script setup lang="ts">
  const { data: mountain } = await useFetch('/api/mountain')
</script>
