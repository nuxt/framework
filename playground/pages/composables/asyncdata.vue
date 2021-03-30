<template>
  <pre>
    {{ test.sample }}
    {{ secondTest.another }}
  </pre>
</template>

<script>
import { defineNuxtComponent, syncData } from 'nuxt/app/composables'

export default defineNuxtComponent({
  setup () {
    const { data: test } = syncData('test', () => new Promise(resolve => resolve({ sample: 42 })))
    const { data: secondTest } = syncData('secondTest', () => new Promise(resolve => setTimeout(() => resolve({ another: process.server ? 'server' : 'client' }), 50)))

    return {
      test,
      secondTest
    }
  }
})
</script>
