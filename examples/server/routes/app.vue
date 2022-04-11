<template>
  <NuxtExampleLayout example="server/routes">
    <p>Count fetched from <pre>/api/count</pre>:</p>
  </NuxtExampleLayout>
</template>

<script setup>
const { data } = await useFetch('/api/count')
console.log(data)
</script>
