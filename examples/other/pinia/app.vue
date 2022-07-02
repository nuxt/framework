<script lang="ts" setup>
import { useStore } from '@/store'
const store = useStore()
</script>

<template>
  <div>
    <!-- <NuxtWelcome /> -->
    <p>Count: {{ store.$state.count }}</p>
    <p>Name: {{ store.$state.name }}</p>
    <button @click="store.press()">
      Press me
    </button>
  </div>
</template>
