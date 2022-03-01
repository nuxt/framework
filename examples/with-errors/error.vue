<template>
  <div class="relative font-sans" n="green6">
    <div class="container max-w-200 mx-auto py-10 px-4">
      <h1>{{ err.message }}</h1>
      There was an error 😱

      <button @click="handleError">
        Clear errors
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  errors: Array
})
const emit = defineEmits<{
  (event: 'errorHandled', redirect?: string): void
}>()

const handleError = () => emit('errorHandled', '/')

const err = props.errors[0] as any
</script>
