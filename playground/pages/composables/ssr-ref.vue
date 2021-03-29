<template>
  <pre>
    {{ serverSet }}
    {{ factoryFunction }}
  </pre>
</template>

<script>
import { defineComponent } from 'vue'
import { ssrRef } from 'nuxt/app/composables'

export default defineComponent({
  setup () {
    const serverSet = ssrRef('not set', 'test')
    if (process.server) {
      serverSet.value = 'set on server'
    }
    const factoryFunction = ssrRef(() => 'function value', 'test2')
    return {
      serverSet,
      factoryFunction
    }
  }
})
</script>
