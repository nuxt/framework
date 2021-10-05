<template>
  <nav>
    <ul class="flex gap-6">
      <li v-for="(link, index) in links" :key="index">
        <NuxtLink :to="link.to" class="font-medium" :class="{ 'text-primary' : isActive(link) }">
          {{ link.title }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script>
import { defineComponent, useContext, useAsync, useRoute, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup () {
    const { $docus, i18n } = useContext()
    const route = useRoute()
    const links = ref([])

    useAsync(async () => {
      links.value = (await $docus
        .search('/collections/header')
        .where({ language: i18n.locale })
        .fetch()).links
    })

    function isActive (link) {
      const path = route.value.path !== '/' && route?.value?.params?.pathMatch && route.value.params.pathMatch.split('/')[0]
      return `/${path}` === link.to
    }

    return {
      links,
      isActive
    }
  }
})
</script>
