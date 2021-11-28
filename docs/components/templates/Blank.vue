<template>
  <DocusContent :document="page" :class="page.bgClass" />
</template>

<script lang="ts">
import { defineComponent } from '#app'

export default defineComponent({
  props: {
    page: {
      type: Object,
      required: true
    }
  }
})
</script>
