<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useApollo } from './composables/apollo'

export default defineComponent({
  setup () {
    useApollo()
  }
})
</script>
