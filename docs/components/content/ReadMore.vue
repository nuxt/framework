<template>
  <Alert>
    <Icon class="inline-block w-5 h-5" name="heroicons-outline:information-circle" />
    Read more in
    <NuxtLink :to="link">
      {{ computedTitle }}
    </NuxtLink>.
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
