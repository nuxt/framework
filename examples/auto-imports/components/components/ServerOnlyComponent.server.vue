<script setup lang="ts">
defineProps({ foo: Number })
const otherState = useState('other', () => 1)
otherState.value++
const colors = [
  'red',
  'blue',
  'yellow'
]
const color = colors[otherState.value % colors.length]
</script>

<template>
  <NCard class="flex flex-col gap-1 p-4">
    I'm a server component with some reactive state: {{ foo + otherState }}
  </NCard>
</template>

<style scoped>
.flex {
  color: v-bind(color)
}
</style>
