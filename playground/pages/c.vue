<template>
  <div>
    {{ data }}
    <NuxtPage />
  </div>
</template>

<script setup>
await Promise.resolve()
console.log('C(ASYNC)')
const { data } = await useAsyncData(() => new Promise(resolve => resolve({ foo: 'c' }), 400))
console.log('Hydrating In C ' + useNuxtApp().isHydrating)
</script>
