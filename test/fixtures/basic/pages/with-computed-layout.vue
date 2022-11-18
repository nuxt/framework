<script setup>
const test = ref('custom')
definePageMeta({
  layout: computed(() => test.value)
})
</script>

<template>
  <div>
    <div>with-computed-layout.vue</div>
    <button @click="layout = layout ? null : 'custom'">
      Switch layout
    </button>
  </div>
</template>
