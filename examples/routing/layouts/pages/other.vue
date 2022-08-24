<script setup>
definePageMeta({
  middleware: 'other'
})
const layoutName = setLayout()
</script>

<template>
  <div>
    <div>{{layoutName}}</div>
    <div>Welcome to nuxt3</div>
    <NuxtLink to="/">
      Back to home
    </NuxtLink>
  </div>
</template>
