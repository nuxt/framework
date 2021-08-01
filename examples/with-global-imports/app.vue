<template>
  <div>
    {{counter}}x2={{doubled}}
    <button @click="inc">Inc</button>
  </div>
</template>

<script setup>
const counter = ref(1)
const doubled = computed(() => counter.value * 2)

function inc () {
  counter.value += 1
}
</script>
