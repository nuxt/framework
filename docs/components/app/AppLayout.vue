<template>
  <div class="relative w-full">
    <AppHeader :links="headerLinks" />

    <div class="lg:flex" :class="{ 'd-container': layout.aside }">
      <slot v-if="['xs', 'sm', 'md'].includes($mq) || layout.aside" name="aside">
        <AppAside :links="headerLinks" :class="layout.asideClass" />
      </slot>

      <div class="flex-auto w-full min-w-0 lg:static lg:max-h-full lg:overflow-visible">
        <slot />
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent, useLazyAsyncData } from '#app'
import { useDocusLayout, useDocusContent } from '#docus'

export default defineComponent({
  setup () {
    const layout = useDocusLayout()
    const $content = useDocusContent()

    const { data: headerLinks } = useLazyAsyncData(
      'header-links',
      async () => {
        const collection = await $content
          .search('/collections/header')
          .fetch()

        return collection.links
      }
    )

    return {
      layout,
      headerLinks
    }
  }
})
</script>
