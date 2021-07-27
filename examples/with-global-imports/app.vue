<template>
  <div>
    {{counter}}x2={{doubled}}
    <button @click="inc">Inc</button>
  </div>
</template>

<script setup>
const counter = ref(0)
const doubled = computed(() => counter.value * 2)

function incCounter () {
  counter.value += 1
}
</script>
