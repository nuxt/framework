<template>
  <footer class="relative u-bg-white">
    <div class="absolute inset-x-0 h-1 border-b bottom-44 sm:bottom-24 u-border-gray-200" />
    <UContainer padded class="pt-12 pb-8">
      <div
        class="grid grid-cols-2 pb-12 sm:grid-cols-4 lg:grid-cols-6 gap-y-12"
      >
        <div
          v-for="item in links"
          :key="item.title"
          class="flex flex-col gap-5 text-sm u-text-gray-600"
        >
          <span class="font-semibold uppercase">{{
            item.title
          }}</span>
          <ul class="flex flex-col gap-y-5">
            <li v-for="link in item.items" :key="link.title">
              <ULink :to="link.to">
                {{ link.title }}
              </ULink>
            </li>
          </ul>
        </div>
        <div
          class="flex flex-col items-start col-span-2 gap-5 sm:col-span-4 lg:col-span-2"
        >
          <LogoFull class="w-auto h-12 u-text-gray-900" />
          <span class="text-sm u-text-gray-700">Stay up to date with our newsletter</span>
          <form class="flex w-full gap-3" @submit.prevent="onSubmit">
            <UInput
              v-model="form.email"
              name="email"
              placeholder="Enter your email"
              class="w-60 lg:flex-1"
              size="sm"
              required
            />
            <UButton
              type="submit"
              submit
              variant="primary"
              :loading="loading"
              label="Subscribe"
              size="xs"
            />
          </form>
          <ul class="flex gap-x-6">
            <li v-for="social in socialLinks" :key="social.name">
              <a :href="social.href">
                <UIcon :name="social.name" class="w-6 h-5 transition-colors u-text-gray-400 hover:u-text-gray-900" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <ThemeSelect name="theme" class="order-1 sm:order-none" size="sm" />
          <span class="text-sm u-text-gray-400">© 2022 Nuxt</span>
        </div>

        <ul class="flex text-sm gap-x-6">
          <li v-for="link in legalLinks" :key="link.title">
            <NuxtLink :to="link.to">
              {{ link.title }}
            </NuxtLink>
          </li>
        </ul>

        <USelect
          v-model="lang"
          :options="langs"
          name="lang"
          size="sm"
        />
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
const form = reactive({
  email: ''
})

const loading = ref(false)

function onSubmit () {
}

const { findOne } = useContentQuery().where({ id: 'content:footer.md' })

const { data: footerData } = await useAsyncData('footer-content', findOne)

const { legalLinks, links, socialLinks } = footerData.value

const langs = ref([{ text: 'English', value: 'en' }])

const lang = ref(langs.value[0])
</script>
