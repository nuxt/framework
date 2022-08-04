<template>
  <div>
    App Config:
    <pre v-html="JSON.stringify(appConfig)" />
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
</script>
