<template>
  <div class="relative flex-1">
    <slot name="header" />

    <main class="relative py-8">
      <UContainer>
        <div v-if="route.params.slug && route.params.slug.length" class="lg:grid lg:grid-cols-12 lg:gap-10 lg:relative">
          <aside class="pb-8 overflow-x-hidden overflow-y-auto lg:pb-0 lg:sticky lg:top-16 sm:px-6 lg:px-0 lg:pt-8 lg:-mt-8 lg:self-start lg:col-span-3 lg:h-[calc(100vh-64px)]">
            <slot name="left" />
          </aside>

          <div class="space-y-6 overflow-hidden sm:px-6 lg:px-0 lg:col-span-7">
            <slot />
          </div>

          <div class="pb-8 lg:pb-0 lg:sticky lg:top-16 sm:px-6 lg:px-0 lg:pt-8 lg:-mt-8 lg:self-start lg:col-span-2">
            <slot name="right" />
          </div>
        </div>
        <DocsHero v-else />
      </UContainer>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
