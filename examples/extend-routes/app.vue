<script setup>
const routes = useRouter().getRoutes()
</script>

<template>
  <div>
    <ul>
      <li v-for="route of routes" :key="route.path">
        <NuxtLink :to="route">
          {{ route.path }}
        </NuxtLink>
      </li>
    </ul>
    <NuxtPage />
  </div>
</template>
