<script setup lang="ts">
defineProps({
  bool: Boolean,
  number: Number,
  str: String,
  obj: Object
})
let wasRouter = false
try {
  wasRouter = !!useRoute()
} catch (e) {}
</script>

<template>
  <pre>
    {{ JSON.stringify(bool) }}
    {{ JSON.stringify(number) }}
    {{ JSON.stringify(str) }}
    {{ JSON.stringify(obj) }}
    Was router enabled: {{ wasRouter }}
  </pre>
</template>
