<template>
  <div>
    <nuxt-link :to="`/test/${Math.random() * 100}`">
      Random path
    </nuxt-link>
    {{ route.path }}
  </div>
</template>

<script>
import { useRoute } from '#app'
export default {
  setup () {
    const route = useRoute()
    console.log(route.path)
    return { route }
  }
}
</script>
