<template>
  <div>
    Hello World
  </div>
</template>

<script>
import { defineNuxtComponent } from '@nuxt/app'
import { useMeta } from 'vue-meta'

export default defineNuxtComponent({
  setup () {
    useMeta({ title: 'Testing' })
  }
})
</script>
