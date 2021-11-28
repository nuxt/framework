<template>
  <nav
    class="
      flex flex-col
      justify-start
      max-w-sm
      overflow-y-auto
      text-sm
      font-medium
      lg:h-[reset]
      h-(full-header)
      d-scrollbar
      py-4
      px-4
      sm:px-6
      lg:pr-0 lg:pt-8
    "
  >
    <!-- Title -->
    <h5 v-if="['xs', 'sm', 'md'].includes($mq) && title" class="m-0 py-2 font-medium text-base uppercase">
      {{ title }}
    </h5>

    <!-- Links list -->
    <ul>
      <template v-for="link in links">
        <AsideNavigationItem
          v-if="link.nested !== false && link.children.length"
          :key="link.to"
          :title="link.title"
          :docs="link.children"
          :collapse="link.collapse"
          @update:collapse="link.collapse = $event"
        />
        <AsideNavigationItem v-else :key="link.to" :docs="[link]" />
      </template>
    </ul>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from '#app'
import { useDocusNavigation } from '#docus'

export default defineComponent({
  setup () {
    const { currentNav, isLinkActive } = useDocusNavigation()

    // Replicate currentNav locally
    const links = ref(currentNav.value.links)

    // Category title
    const title = ref(currentNav.value.title)

    // Category slug
    const slug = ref(currentNav.value.slug)

    // Check if current current navigation has directories
    const isDirectory = computed(
      () => links.value.filter(link => link.children && link.children.length > 0).length === 0
    )

    // Watch updates on currentNav
    watch(
      currentNav,
      (newVal) => {
        links.value = newVal.links
        title.value = newVal.title
        slug.value = newVal.slug
      },
      { deep: true }
    )

    // Uncollapse current category on first navigation
    watch(
      links,
      (newVal) => {
        newVal.forEach((link) => {
          if (link.children && link.children.length > 0) {
            const isCategoryActive = link.children.some(document => isLinkActive(document.to))

            if (isCategoryActive) {
              link.collapse = false
            }
          }
        })
      },
      { immediate: true }
    )

    // Get parent
    const parent = computed(() => currentNav.value.parent)

    return { isDirectory, links, title, slug, parent }
  }
})
</script>
