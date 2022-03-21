<template>
  <li ref="collapsible" class="relative overflow-hidden">
    <template v-if="item.children && item.children.length">
      <DocsLink :link="item">
        <div ref="asideItem" class="flex items-center justify-between pr-12" @click="collapse">
          <span>{{ item.label }}</span>
        </div>
        <ul v-if="opened" ref="asideLinks" class="flex flex-col mt-2 text-sm">
          <li
            v-for="link in item.children"
            :key="link.label"
            class="pl-2 border-l-2 u-border-gray-300 hover:u-border-gray-900 "
            :class="{ 'u-border-gray-900': route.path === link.to }"
          >
            <DocsAsideItemLink :link="link" />
          </li>
        </ul>
      </DocsLink>
    </template>

    <DocsAsideItemLink v-else :link="item" />
  </li>
</template>

<script setup lang="ts">
defineProps({
  item: {
    type: Object,
    required: true
  }
})

const route = useRoute()

const emit = defineEmits(['collapse'])

const collapsible = ref(null)
const asideItem = ref<HTMLElement | null>(null)
const asideLinks = ref<HTMLElement | null>(null)

const { collapse, opened } = useCollapsible(emit, collapsible, asideItem, asideLinks, 24)
</script>
