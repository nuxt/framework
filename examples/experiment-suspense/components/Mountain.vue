<script setup>
const props = defineProps({
  slug: {
    type: String,
    required: true
  }
})
const slug = toRef(props, 'slug')
const bg = ref('')
// const { data: mountain, refresh } = await useFetch(`https://api.nuxtjs.dev/mountains/${props.slug}`)
const { data: mountain, refresh } = await useAsyncData(`mountain-${slug.value}`, () => $fetch(`https://api.nuxtjs.dev/mountains/${slug.value}`))
computed(() => {
  console.log('Slug changed', props.slug)
  refresh()
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl mb-2">
      {{ mountain.title }}
    </h1>
    <pre :class="bg" class="border-gray-400 border transition p-4 transition-1000 transition-all overflow-auto rounded">{{ mountain }}</pre>
  </div>
</template>
