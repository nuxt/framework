<template>
  <div>
    <MyNuxtLink to="https://nuxtjs.org">
      This link has no default `rel` attribute
    </MyNuxtLink>
    <MyNuxtLink to="/">
      This link has the `.active` class and therefore is styled red
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

.active {
  color: red;
}
</style>
