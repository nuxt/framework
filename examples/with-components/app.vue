<script setup lang="ts">
const openInEditor = () => {
  fetch('/__open-in-editor?file=app.vue')
}
</script>

<template>
  <div class="relative font-sans" n="green6">
    <div class="container max-w-200 mx-auto py-10 px-4">
      <div class="flex flex-col gap-2 items-center">
        <img src="https://raw.githubusercontent.com/nuxt/framework/main/playground/assets/logo.svg" h="12">
        <div class="text-xl flex">
          <div class="op-50">
            examples/
          </div>
          <NLink href="https://github.com/nuxt/framework/tree/main/examples/components" target="_blank">
            components
          </NLink>
        </div>
      </div>
      <NCard class="mt-8 p-6 flex flex-col gap-5 text-center">
        <h1 class="text-xl opacity-50">
          Auto Imported Components
        </h1>
        <div>
          <!-- Auto Imported Components -->
          <HelloWorld class="text-2xl" />
          <Nuxt3 class="text-2xl" />
          <ParentFolderHello class="mt-6" />
        </div>
      </NCard>

      <!-- Tips -->
      <div class="transition py-5 flex items-center gap-2 text-gray-400">
        <NIcon icon="carbon-idea" class="text-xl flex-none" />
        <div>
          Components under <code>components/</code> folder are auto imported and can be directly used in your templates.
          Read more about
          <NLink href="https://v3.nuxtjs.org/docs/directory-structure/components" target="_blank">
            the components directory.
          </NLink>
        </div>
        <NButton icon="carbon-edit" class="flex-none" @click="openInEditor">
          Open in Editor
        </NButton>
      </div>
    </div>
  </div>
</template>
