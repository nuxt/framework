<template>
  <Alert icon="👉">
    Read more in <Link :to="link" v-text="computedTitle" />.
  </Alert>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'
import createTitle from '~/utils/createTitle'

export default defineComponent({
  props: {
    link: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: false
    }
  },
  computed: {
    computedTitle () {
      // Guess title from link!
      return createTitle(this.title, this.link)
    }
  }
})
</script>
