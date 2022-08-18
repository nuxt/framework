<script setup lang="ts">
defineProps({
  bool: Boolean,
  number: Number,
  str: String,
  obj: Object
})

const hasRouter = useState('hasRouter', () => !!useRouter())
</script>

<template>
  <pre>
    {{ JSON.stringify(bool) }}
    {{ JSON.stringify(number) }}
    {{ JSON.stringify(str) }}
    {{ JSON.stringify(obj) }}
    Was router enabled: {{ hasRouter }}
  </pre>
</template>

<style scoped>
pre {
  color: blue
}
</style>
