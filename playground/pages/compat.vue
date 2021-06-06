<template>
  <div>
    {{ test }}
  </div>
</template>

<script>
// TODO: alias is not working on server
import Vue from 'vue'
if (process.client) {
  console.log(Vue, Vue?.config)
}

export default {
  // We can opt components in-out of compat mode
  // compatConfig: {
  //   MODE: 2
  // },
  data: () => ({
    test: 42
  }),
  mounted () {
    console.log('mounted')
  }
}
</script>
