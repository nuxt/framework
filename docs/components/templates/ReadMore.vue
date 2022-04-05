<template>
  <Alert icon="👉">
    Read more in <NuxtLink :to="link" v-text="title" />.
  </Alert>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'
import { splitByCase, upperFirst } from 'scule'

export default defineComponent({
  props: {
    link: {
      type: String,
      required: true
    }
  },
  computed: {
    title () {
      // Guess title from link!
      return this.link.split('/')
        .filter(Boolean).map(part => splitByCase(part).map(p => upperFirst(p)).join(' ')).join(' > ')
    }
  }
})
</script>
