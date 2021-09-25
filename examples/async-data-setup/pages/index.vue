<script setup lang="ts">
const { data } = asyncData('time', () => $fetch('/api/count'))
</script>

<template>
  <div>
    Page visits: {{ data.count }}
  </div>
</template>
