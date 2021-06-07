# app.vue

If you would like to customize the layout of your Nuxt 3 application, you can create an `app.vue` file in your source directory. Nuxt will automatically detect it and load it as the parent of all other pages within your application.

## Default `app.vue`

```vue
<template>
  <NuxtPage />
</template>
```

**Info**: `<NuxtPage>` is a special built-in component that allows for the use of `asyncData` throughout your application. You should make sure that you have `<NuxtPage />` somewhere in your custom `app.vue`.

## Layouts

Nuxt 3 does not come with automatic layout registration out of the box. You will need to implement this yourself. Example:

```vue
<template>
  <BlogLayout v-if="$route.path.startsWith('/blog')" />
  <DefaultLayout v-else />
</template>

<script setup>
import BlogLayout from './layouts/blog.vue'
import DefaultLayout from './layouts/default.vue'
</script>
```
