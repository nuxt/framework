<template>
  <div>
    <NuxtLink to="https://twitter.com/nuxt_js" target="_blank">
      Nuxt Twitter
    </NuxtLink>
    <NuxtLink to="https://discord.nuxtjs.org" target="_blank" rel="noopener">
      Nuxt Discord
    </NuxtLink>
    <NuxtLink to="https://github.com/nuxt" no-rel>
      Nuxt GitHub
    </NuxtLink>
    <NuxtLink to="/contact" target="_blank">
      Contact page opens in another tab
    </NuxtLink>
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
