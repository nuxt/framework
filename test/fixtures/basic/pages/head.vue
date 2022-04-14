<script setup>
const a = ref('overriding')
useHead({
  bodyAttrs: {
    class: 'body-attrs-test'
  },
  meta: [{ name: 'description', content: 'first' }]
})
useHead({ charset: 'utf-16', meta: [{ name: 'description', content: computed(() => `${a.value} with an inline useHead call`) }] })
useMeta({ script: [{ children: 'console.log("works with useMeta too")' }] })
</script>

<script>
export default {
  head () {
    return {
      htmlAttrs: {
        class: 'html-attrs-test'
      }
    }
  }
}
</script>

<template>
  <div>
    <Head>
      <Title>Using a dynamic component</Title>
    </Head>
  </div>
</template>
