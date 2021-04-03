<template>
  <div>
    {{ test.bar }}
  </div>
</template>

<script>
import { inject } from 'vue'

export default {
  setup () {
    const test = inject('test')

    return { test }
  }
}
</script>
