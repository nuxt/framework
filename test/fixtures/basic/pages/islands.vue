<script setup lang="ts">
const islandProps = ref({
  bool: true,
  number: 100,
  str: 'helo world',
  obj: { json: 'works' }
})
</script>

<template>
  <div>
    Pure island component:
    <div class="box">
      <NuxtIsland name="PureComponent" :props="islandProps" />
    </div>
    <button @click="islandProps.number++">
      Increase
    </button>
    <hr>
    Route island component:
    <div class="box">
      <NuxtIsland name="RouteComponent" :context="{ url: '/test' }" />
    </div>
  </div>
</template>

<style scoped>
.box {
  border: 1px solid black;
  margin: 3px;
}
</style>
