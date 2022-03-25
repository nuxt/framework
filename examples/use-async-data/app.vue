<script setup>
const ctr = ref(0)
const showMountain = ref(false)
const { data, pending } = await useAsyncData('/api/hello', () => $fetch(`/api/hello/${ctr.value}`), { watch: [ctr] })
const refresh = useNuxtApp().callHook('app:refresh')
</script>

<template>
  <NuxtExampleLayout example="use-async-data" show-tips>
    <div>{{ data }}</div>
    <div>
      <NButton :disabled="pending" @click="refresh">
        Refresh Data
      </NButton>
      <NButton :disabled="pending" @click="ctr++">
        +
      </NButton>
      <NButton @click="showMountain = !showMountain">
        {{ showMountain ? 'Hide' : 'Show' }} Mountain
      </NButton>
      <Mountain v-if="showMountain" />
    </div>
    <template #tips>
      <div>
        <p>
          This example shows how to use <code>useAsyncData</code> to fetch data from an API endpoint.
        </p>
        <p>
          Nuxt will automatically read files in the
          <a href="https://v3.nuxtjs.org/docs/directory-structure/server#api-routes" target="_blank">
            <code>~/server/api</code> directory
          </a>
          to create API endpoints. Learn more about
          <a href="https://v3.nuxtjs.org/docs/usage/data-fetching" target="_blank">data fetching</a>
        </p>
      </div>
    </template>
  </NuxtExampleLayout>
</template>
