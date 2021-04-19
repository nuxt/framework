<template>
  <div>
    <ul class="breadcrumb mb-3">
      <li v-for="p in (slug || '').split('/').filter(Boolean)" :key="p">
        {{ p }}
      </li>
    </ul>
    <NuxtContent :content="content" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { defineNuxtComponent } from '@nuxt/app'
import { useContent, NuxtContent } from '~/modules/content/runtime'

export default defineNuxtComponent({
  components: {
    NuxtContent
  },
  setup () {
    const route = useRoute()

    // Slug and page data
    const slug = ref(route.fullPath)

    const { data: content } = useContent(slug.value)

    return {
      slug,
      content
    }
  }
})
</script>

<style>
  .breadcrumb li {
    display: inline;
    /* padding: 0 .2em; */
  }

  .breadcrumb li+li::before {
    padding: 0 .5em;
    @apply text-gray-400;
    content: "/";
  }

  .markdown h1 {
    @apply text-4xl;
  }

  .markdown h2 {
    @apply text-3xl;
  }

  .markdown h3 {
    @apply text-2xl;
  }

  .markdown h4 {
    @apply text-1xl;
  }

  .markdown blockquote {
    @apply border-l-2 border-primary-500 pl-2 ml-1;
  }

  .markdown code {
    @apply text-green-800 rounded;
  }

  .markdown code::before, .markdown code::after {
    content: "`";
  }
</style>
