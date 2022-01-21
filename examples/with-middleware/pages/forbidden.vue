<template>
  <div>
    Forbidden
  </div>
</template>

<script setup>
definePageMeta({
  // This is an example of inline middleware
  middleware: (_to, _from, next) => {
    console.log('Strictly forbidden.')
    next(false)
  }
})
</script>
