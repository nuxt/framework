<template>
  <nav>
    <ul class="flex gap-6">
      <li v-for="(link, index) in links" :key="index">
        <NuxtLink :to="link.to" class="font-medium">
          {{ link.title }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script>
import { defineComponent, useContext, useAsync, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup () {
    const { $docus, i18n } = useContext()
    const links = ref([])

    useAsync(async () => {
      links.value = (await $docus
        .search('/collections/header')
        .where({ language: i18n.locale })
        .fetch()).links
    })

    return {
      links
    }
  }
})
</script>
