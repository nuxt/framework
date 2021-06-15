<script nuxt setup lang="ts">
import { asyncData } from '@nuxt/app'

const { data } = asyncData('time', () => $fetch('/api/count'))
</script>

<template>
  <div>
    Page visits: {{ data.count }}
  </div>
</template>
