<template>
  <div>
    <NuxtLink to="/random/a">
      Random (A)
    </NuxtLink>
    <NuxtLink to="/random/b">
      Random (B)
    </NuxtLink>
    <NuxtLink to="/random/c">
      Random (C)
    </NuxtLink>
    <br>

    Random page: <b>{{ route.params.id }}</b><br>

    Here are some random numbers for you:

    <ul>
      <li v-for="n in randomNumbers" :key="n">
        {{ n }}
      </li>
    </ul>
    <button @click="() => refresh()">
      Give me another set
    </button>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: randomNumbers, refresh } =
  await useFetch('/api/random', { key: '_rand' + route.params.id as string })
</script>
