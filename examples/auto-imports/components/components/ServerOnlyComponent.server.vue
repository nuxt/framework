<script setup lang="ts">
defineProps({ foo: Number })
const otherState = useState('other', () => 1)
</script>

<template>
  <NCard class="flex flex-col gap-1 p-4">
    I'm a server component with some reactive state: {{ foo + otherState }}
  </NCard>
</template>
