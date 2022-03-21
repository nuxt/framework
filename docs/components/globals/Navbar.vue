<template>
  <header class="bg-white dark:bg-black">
    <UContainer padded>
      <div class="grid items-center h-20 grid-cols-2 gap-3 sm:grid-cols-6">
        <div class="flex justify-start">
          <NuxtLink to="/" class="block u-text-black">
            <LogoFull class="hidden w-auto h-8 sm:block" />
            <Logo class="block w-auto h-6 sm:hidden" />
          </NuxtLink>
        </div>

        <div class="flex justify-center col-span-4 gap-x-10">
          <ULink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            :exact="link.exact"
            class="font-medium hover:u-text-gray-900"
            active-class="font-semibold u-text-gray-900"
            inactive-class="u-text-gray-500"
          >
            {{ link.label }}
          </ULink>
        </div>

        <div class="flex justify-end">
          <UButton
            label="Get Started"
            icon="fa:arrow-circle-right"
            variant="primary"
            size="sm"
            @click="onClick"
          />
        </div>
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()

const onClick = () => {}

const links = computed(() => {
  return [{
    label: 'Getting Started',
    to: '/getting-started/introduction',
    exact: false
  }, {
    label: 'Concepts',
    to: '/concepts/introduction',
    exact: true
  }, {
    label: 'Docs',
    to: '/docs/usage/data-fetching',
    exact: true
  }, {
    label: 'Community',
    to: '/community/getting-help',
    exact: true
  }]
})
</script>
