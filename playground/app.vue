<script setup lang="ts">
const appConfig = useAppConfig()
watch(appConfig, () => {
  console.log('App config updated:', appConfig)
})
</script>

<template>
  <!-- Edit this file to play around with Nuxt but never commit changes! -->
  <div>
    Hello World {{ appConfig }}
  </div>
</template>

<style scoped>
</style>
