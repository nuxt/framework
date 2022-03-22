<template>
  <li ref="collapsible" class="relative overflow-hidden">
    <template v-if="item.children && item.children.length">
      <div v-for="directory in item.children" :key="directory.slug">
        <div v-if="directory && directory.children && directory.children.length" class="mb-6">
          <div ref="asideItem" class="flex items-center justify-between pr-12 font-bold">
            <span>{{ directory.title }}</span>
          </div>
          <ul class="flex flex-col mt-2 text-sm min-w-full">
            <li
              v-for="link in directory.children"
              :key="link.title"
              class="pl-2 border-l-2 u-border-gray-300 hover:u-border-gray-900 text-left"
              :class="{ 'u-border-gray-900': route.path === link.slug }"
            >
              <DocsAsideItemLink :link="link" />
            </li>
          </ul>
        </div>

        <div
          v-else
          :key="directory.title"
          class="pl-2 border-l-2 u-border-gray-300 hover:u-border-gray-900 text-left"
          :class="{ 'u-border-gray-900': route.path === directory.slug }"
        >
          <DocsAsideItemLink :link="directory" />
        </div>
      </div>
    </template>
  </li>
</template>

<script setup lang="ts">
import type { NavItem } from '@nuxt/content/dist/runtime/types'
import type { PropType } from 'vue'

defineProps({
  item: {
    type: Object as PropType<NavItem>,
    required: true
  }
})

const route = useRoute()

// const emit = defineEmits(['collapse'])

// const collapsible = ref(null)
// const asideItem = ref<HTMLElement | null>(null)
// const asideLinks = ref<HTMLElement | null>(null)

// const { collapse, opened } = useCollapsible(emit, collapsible, asideItem, asideLinks, 24)
</script>
