<template>
  <pre>
    {{ test.sample }}
    {{ test2.sample }}
    {{ secondTest.another }}
  </pre>
</template>

<script>
import { defineNuxtComponent, asyncData, useAsyncData } from 'nuxt/app/composables'

export default defineNuxtComponent({
  setup () {
    const _asyncData = useAsyncData()

    const { data: test } = asyncData('test', async () => await Promise.resolve(({ sample: 42 })))
    const { data: test2 } = _asyncData('test2', async () => await Promise.resolve(({ sample: 'string' })))

    const { data: secondTest } = asyncData('secondTest', () => new Promise(resolve => setTimeout(() => resolve({ another: process.server ? 'server' : 'client' }), 50)))

    return {
      test,
      test2,
      secondTest
    }
  }
})
</script>
