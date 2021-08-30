<template>
  <div>Hello Vue {{ ctr }}!</div>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'

export default defineComponent({
  setup () {
    const ctr = ref(2)
    return { ctr }
  }
})
</script>
