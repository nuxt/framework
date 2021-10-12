<template>
  <div>
    <h2>Handled error</h2>
    <div v-if="error">
      We handled this error ("{{ error.message }}") so no error page for us!
    </div>
  </div>
</template>

<script setup lang="ts">
const { error } = await useAsyncData('error-async-handled', async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  throw new Error('Throwing this error just because I can.')
})
</script>
