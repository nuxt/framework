<template>
  <div>You should not see me</div>
</template>

<script setup>
await navigateTo('https://example.com/', { allowExternal: true, replace: true })
</script>
