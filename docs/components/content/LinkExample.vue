<template>
  <Alert type="info" icon="🔎">
    Read and edit a live example in <NuxtLink :to="link" v-text="computedTitle" />.
  </Alert>
</template>

<script setup lang="ts">
import createTitle from '~/utils/createTitle'

const props = defineProps({
  link: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: false
  }
})

const computedTitle = computed(() => createTitle(props.title, props.link))
</script>
