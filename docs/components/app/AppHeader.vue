<template>
  <header class="d-header">
    <div class="flex items-center h-full px-1 mx-auto max-w-7xl sm:px-3 lg:px-6">
      <NavigationButton
        aria-label="mobileMenu"
        class="w-12 h-12 lg:hidden text-gray-300 hover:text-cloud-lighter"
      />

      <div class="flex items-center flex-1 justify-center lg:justify-start">
        <Link :to="localePath('/')" aria-label="homeLink">
          <Logo :settings="settings" class="h-8 md:h-9" />
        </Link>
      </div>

      <nav class="items-center hidden h-full lg:flex gap-4">
        <NuxtLink v-for="(link, index) in links" :key="index" :to="link.to" class="font-medium px-2 py-1" :class="{ 'text-primary' : isActive(link) }">
          {{ link.title }}
        </NuxtLink>
      </nav>

      <div class="flex items-center justify-end gap-1 lg:flex-1">
        <GitHubButton />
        <TwitterButton class="hidden lg:block" />
        <ColorSwitcher class="hidden lg:block" padding="p-3" />
        <AlgoliaSearchBox v-if="settings && settings.algolia" :options="settings.algolia" :settings="settings" />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { useDocusConfig } from '#docus'
import { defineComponent, computed, useNuxtApp } from '#app'

export default defineComponent({
  props: {
    links: {
      type: Array,
      default: () => []
    }
  },
  setup () {
    const app = useNuxtApp()
    const settings = useDocusConfig()
    const { $route } = app
    const route = computed(() => $route)

    const currentSlug = computed(() => {
      return route.value.path !== '/' && route.value.params?.pathMatch
        ? route.value.params.pathMatch.split('/')[0]
        : null
    })

    function isActive (link) {
      return `/${currentSlug.value}` === link.to
    }

    return {
      settings,
      isActive
    }
  }
})
</script>
