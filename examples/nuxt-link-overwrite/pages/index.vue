<template>
  <div>
    <NuxtLink to="https://nuxtjs.org">
      This link has no default `rel` attribute
    </NuxtLink>
    <NuxtLink to="/">
      This link has the `.active` class and therefore is styled red
    </NuxtLink>
  </div>
</template>

<style scoped>
a {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 3rem;
  padding: 10rem;
}

.active {
  color: red;
}
</style>
