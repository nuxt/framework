<script setup lang="ts">
// this component test the onMounted hook being executed after the component is being rendered
const input = ref<HTMLInputElement | null>(null)
const refValue = ref<string>('unknown')

onMounted(() => {
  refValue.value = input.value ? 'HTMLInputElement' : 'null'
})
</script>

<template>
  <div>
    <input ref="input" v-model="refValue" type="text">
    <pre>FocusInputBroken ref: <span data-test-id="mount-hook-ref-1">{{ refValue }}</span></pre>
  </div>
</template>
