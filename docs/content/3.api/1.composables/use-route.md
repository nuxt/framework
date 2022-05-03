# `useRoute`

::ReadMore{link="/guide/features/routing"}
::

::NeedContribution
::
# `useRoute`

`useRoute` composable returns the location of current route and must be called inside `setup()` function.

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

* **fullPath**: encoded URL associated to the current route that contains path, query and hash
* **hash**: decoded hash section of the URL that starts with a #
* **matched**: array of normalized matched routes with current route location
* **meta**: custom data attached to the record
* **name**: unique name for the route record
* **path**: encoded pathname section of the URL
* **redirectedFrom**: route location that was attempted to access before ending up on the current route location

::ReadMore{link="https://router.vuejs.org/api/#routelocationnormalized"}
::

::ReadMore{link="/guide/features/routing"}
::

::NeedContribution
::
