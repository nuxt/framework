# `useRoute`

::ReadMore{link="/guide/features/routing"}
::

::NeedContribution
::
# `useRoute`

`useRoute` composable returns the location of current route and must be called inside of `setup()` function. 

In Nuxt, `useRoute` is availble to use inside:

- Nuxt pages
- layouts,
- components, 
- composables,
- route middleware and 
- Nuxt plugins. 

`useRoute` composable is accessed in `setup()` function using `useRoute()`, and directly inside the template of Vue component using `$route`.

We can expose possible dynamic parameters of the route via `useRoute` composable. In the following example, we call an API via `useAsyncData` using a dynamic page parameter - `slug` - as part of the URL. 


```html [~/pages/[slug].vue]
<template>
    <h1>{{ data.title }}</h1>
    <p>{{ data.description }}</p>
</template>
<script setup>
const route = useRoute();
const slug = route.params.slug;
const { data, pending, error, refresh } = await useAsyncData("mountain", () =>
    $fetch(`https://api.nuxtjs.dev/mountains/${slug}`)
);
</script>
```

If API endpoint requires query parameters to construct URL, then you can use `route.query` instead of `route.params`.

Apart from dynamic parameters and query parameters, `useRoute` also provides the following computed references related to the current route:

- fullPath - Encoded URL associated to the route location. Contains path, query and hash
- hash - Decoded hash section of the URL. Always starts with a #. Empty string if there is no hash in the URL
- matched - array of normalized route records that were matched with the given route location
- meta - custom data attached to the record
- name - unique name for the route record
- path - encoded pathname section of the URL associated to the route location
- redirectedFrom - route location we were initially trying to access before ending up on the current route location

::ReadMore{link="https://router.vuejs.org/api/#routelocationnormalized"}
::

::ReadMore{link="/guide/features/routing"}
::

::NeedContribution
::
