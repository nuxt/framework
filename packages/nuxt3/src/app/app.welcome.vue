<template>
  <div v-html="html" />
</template>

<script setup>
import { welcome as welcomeTemplate } from '@nuxt/design'

const html = welcomeTemplate()
</script>
