<script setup>
definePageMeta({
  middleware: 'other'
})
const layoutValue = setLayout()
</script>

<template>
  <div>
    <div>{{layoutValue}}</div>
    <div>Welcome to nuxt3</div>
    <NuxtLink to="/">
      Back to home
    </NuxtLink>
  </div>
</template>
