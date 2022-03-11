<template>
  <div>
    <NuxtLink to="https://nuxtjs.org">
      Nuxt website
    </NuxtLink>
    <NuxtLink to="https://twitter.com/nuxt_js" target="_blank">
      Nuxt Twitter with a blank target
    </NuxtLink>
    <NuxtLink to="https://discord.nuxtjs.org" target="_blank" rel="noopener">
      Nuxt Discord with a blank target and custom rel value
    </NuxtLink>
    <NuxtLink to="https://github.com/nuxt" no-rel>
      Nuxt GitHub without rel attribute
    </NuxtLink>
    <MyNuxtLink to="https://nuxtjs.org">
      Nuxt website with a custom link component with no default rel attribute
    </MyNuxtLink>
  </div>
</template>

<style scoped>
a {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 3rem;
  padding: 1rem 10rem;
  display: block;
}
</style>
