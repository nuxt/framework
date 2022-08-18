<template>
  <div>
    <hr>
    Pure island component:
    <NuxtIsland name="PureComponent" :props="islandProps" />
    <button @click="islandProps.number++">
      Increase
    </button>
    <hr>
    Route island component:
    <NuxtIsland name="RouteComponent" :context="{ url: '/test' }" />
  </div>
</template>

<script setup lang="ts">
const islandProps = ref({
  bool: true,
  number: 100,
  str: 'helo world',
  obj: { json: 'works' }
})
</script>
