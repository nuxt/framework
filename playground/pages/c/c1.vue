<template>
  <div>{{ data }}</div>
</template>
<script setup>
console.log('C1')
const a = useNuxtApp()
const { data } = await useAsyncData(() => new Promise(resolve => resolve({ foo: 'c1' }), 400))
console.log('Hydrating In C1 ' + a.isHydrating)
</script>
