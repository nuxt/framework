<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="relative font-sans" n="green6">
    <div class="container max-w-200 mx-auto py-10 px-4">
      <div class="flex flex-col gap-2 items-center mb-4">
        <img src="https://raw.githubusercontent.com/nuxt/framework/main/playground/assets/logo.svg" h="12">
        <div class="text-xl flex">
          <div class="op-50">
            examples/
          </div>
          <NLink href="https://v3.nuxtjs.org/docs/usage/with-pages" target="_blank">
            with-pages
          </NLink>
        </div>
        <slot name="title" />
      </div>
      <slot name="nav" />
      <NCard class="p-6 flex flex-col gap-2 text-center">
        <slot />
      </NCard>
      <slot name="tips" />
      <div class="text-center p-4 op-50">
        Current route: <code>{{ route.path }}</code>
      </div>
    </div>
  </div>
</template>
