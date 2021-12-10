<script setup lang="ts">
const locales = useLocales()
const locale = useLocale()
const date = useLocaleDate(new Date('2016-10-26') /* NUXT_BIRTHDAY */)

const interacted = ref(false)

watch(locale, () => {
  interacted.value = true
})

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
          <NLink href="https://github.com/nuxt/framework/tree/main/examples/locale" target="_blank">
            locale
          </NLink>
        </div>
      </div>
      <NCard class="mt-8 p-6 flex flex-col h-50 gap-2 text-center">
        <h1 class="text-xl opacity-50">
          Nuxt birthday
        </h1>
        <p class="text-4xl">
          {{ date }}
        </p>
        <label for="locale-chooser">Preview a different locale</label>
        <select id="locale-chooser" v-model="locale" class="m-auto w-50 border n-border-base rounded p-1">
          <option v-for="l of locales" :key="l" :value="l">
            {{ l }}
          </option>
        </select>
      </NCard>

      <!-- Tips -->
      <div :class="interacted ? 'opacity-100' : 'opacity-0'" class="transition py-5 flex items-center gap-2 text-gray-400">
        <NIcon icon="carbon-idea" class="text-xl flex-none" />
        <div>
          You can right click to "View Page Source" and see that Nuxt renders the correct date in SSR based on visitor's locale.
        </div>
        <NButton icon="carbon-edit" class="flex-none" @click="openInEditor">
          Open in Editor
        </NButton>
      </div>
    </div>
  </div>
</template>
