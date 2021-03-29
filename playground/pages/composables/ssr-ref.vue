<template>
  <pre>
    {{ ssrRefTest }}
    {{ factoryFunction }}
    {{ ssrShallowRefTest }}
    {{ JSON.stringify(reactiveTest) }}
  </pre>
</template>

<script>
import { defineComponent } from 'vue'
import { ssrRef, ssrShallowRef, ssrReactive } from 'nuxt/app/composables'

export default defineComponent({
  setup () {
    const ssrRefTest = ssrRef('not set', 'ssrRef')
    const ssrShallowRefTest = ssrShallowRef('not set', 'ssrShallowRef')
    const reactiveTest = ssrReactive({ test: 'not set' }, 'ssrReactive')
    if (process.server) {
      ssrRefTest.value = 'set on server'
      ssrShallowRefTest.value = 'set on server'
      reactiveTest.another = 'set on server'
    }
    const factoryFunction = ssrRef(() => 'function value', 'factoryFunction')
    return {
      ssrRefTest,
      factoryFunction,
      ssrShallowRefTest,
      reactiveTest
    }
  }
})
</script>
