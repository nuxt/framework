<template>
  <div>
    Hello World {{ date }}
  </div>
</template>

<script>
import date from 'virtual-build-time'
import { defineNuxtComponent } from '@nuxt/app'

export default defineNuxtComponent({
  setup () {
    return {
      date
    }
  }
})
</script>
