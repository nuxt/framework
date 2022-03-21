<template>
  <SubNavbar>
    <div class="relative grid items-center justify-between h-16 grid-cols-2 gap-3 sm:grid-cols-6">
      <div class="flex items-center justify-start gap-3">
        <p class="font-semibold">
          Framework
        </p>

        <USelect
          v-model="version"
          :options="versions"
          name="version"
          size="xs"
        />
      </div>

      <div class="flex justify-center col-span-4 gap-x-8">
        <DocsLink
          v-for="link in links"
          :key="link.label"
          :link="link"
          class="text-sm hover:u-text-gray-900"
        >
          {{ link.label }}
        </DocsLink>
      </div>

      <div class="flex justify-end">
        <UButton icon="fa-brands:github" variant="transparent" href="https://github.com/nuxt/framework" class="!p-0" />
      </div>
    </div>
  </SubNavbar>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

defineProps({
  links: {
    type: Array as PropType<any[]>,
    default: () => []
  }
})

const versions = ref([{ text: 'v3', value: '3' }, { text: 'v2', value: '2' }])
const version = ref(versions.value[0].value)
</script>
