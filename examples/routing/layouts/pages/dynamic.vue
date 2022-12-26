<template>
  <div class="p-4">
    Custom layout defined dynamically with the <code>NuxtLayout</code> component
    <br>
    <NuxtLayout :name="layout ? 'custom' : false">
      Default slot
      <br>
      <button class="border p-1 rounded" @click="layout = !layout">
        Toggle layout
      </button>

      <template #header>
        Header slot
      </template>
    </NuxtLayout>
    <br>
    <NuxtLink to="/">
      Back to home
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: false
  })

  const layout = ref(true);
</script>
