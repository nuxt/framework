<template>
  <pre>
    {{ test.sample }}
    {{ secondTest.another }}
  </pre>
</template>

<script>
import { defineNuxtComponent, asyncData } from 'nuxt/app/composables'

export default defineNuxtComponent({
  setup () {
    const { data: test } = asyncData('test', () => new Promise(resolve => resolve({ sample: 42 })))
    const { data: secondTest } = asyncData('secondTest', () => new Promise(resolve => setTimeout(() => resolve({ another: 'string' }), 50)))

    return {
      test,
      secondTest
    }
  }
})
</script>
