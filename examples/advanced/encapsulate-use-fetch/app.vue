<script setup lang="ts">
import { FeedsApi } from './api/hackernews'

// 1.How to use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { data, pending, refresh, error } = await FeedsApi({ feed: 'news', page: 1 })

// 2.How to use
FeedsApi({ feed: 'news', page: 1 }).then((res) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, pending, refresh, error } = res
})
</script>

<template>
  <NuxtExampleLayout example="advanced/encapsulate-use-fetch">
    <div>Welcome to Nuxt3</div>
    <ul>
      <li v-for="(item, index) in data" :key="index">
        <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
      </li>
    </ul>
  </NuxtExampleLayout>
</template>
