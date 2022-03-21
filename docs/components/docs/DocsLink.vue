<template>
  <ULink
    :to="slug"
    :class="isActive ? 'font-semibold u-text-gray-900' : 'font-medium u-text-gray-500'"
  >
    <slot />
  </ULink>
</template>

<script setup lang="ts">
const props = defineProps({
  link: {
    type: Object,
    required: true
  }
})

const route = useRoute()

const isActive = computed(() => {
  return route.path.includes(props.link.to)
})

const slug = computed(() => {
  return findSlug(props.link)
})

function findSlug (link) {
  let slug = link.to

  if (link.children && link.children.length) {
    slug = findSlug(link.children[0])
  }

  return slug
}
</script>
