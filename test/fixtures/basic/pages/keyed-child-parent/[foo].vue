<template>
  <div :id="`page-${route.params.foo}`">
    [keyed-child-parent/{{ route.params.foo }}]
    <NuxtLink href="/keyed-child-parent/1">
      To another
    </NuxtLink>
  </div>
</template>

<script setup>
console.log('Running Child Setup')
const route = useRoute()

definePageMeta({
  key: 'keyed'
})
</script>
