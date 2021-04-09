<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { provideApollo } from './composables/apollo'

export default defineComponent({
  setup () {
    provideApollo()
  }
})
</script>
