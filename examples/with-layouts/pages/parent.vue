<template>
  <div>
    Parent
    <NuxtChild />

    <NuxtLink v-if="$route.path !== '/parent/child'" to="/parent/child">
      Child Page
    </NuxtLink>
    <NuxtLink v-else to="/parent">
      Parent Page
    </NuxtLink>

    <NuxtLink to="/">
      Home Page
    </NuxtLink>
  </div>
</template>

<script>
export default defineNuxtComponent({
  // layout: 'default'
})
</script>
