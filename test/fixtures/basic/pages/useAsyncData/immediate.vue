<template>
  <div>
    Single
    <div>
      data: {{ data }}
    </div>
  </div>
</template>

<script setup lang="ts">
const called = ref(0)
const { data, execute } = await useAsyncData(() => Promise.resolve(++called.value), { immediate: false })

if (called.value !== 0) {
  throw new Error('Handled should have not been called')
}

if (process.server && data.value !== null) {
  throw new Error('Initial data should be null: ' + data.value)
}

await execute()

if (process.server && called.value !== 1) {
  throw new Error('Should have been called once after execute')
}

if (data.value !== 1) {
  throw new Error('Data should be 1 after execute')
}
</script>
