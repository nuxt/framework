# `useRoute`

The `useRoute` composable returns the current route and must be called in a `setup` function, plugin, or route middleware.

Within the template of a Vue component, you can access the route using `$route`.

We can expose possible dynamic parameters of the route via `useRoute` composable. 

## Example

In the following example, we call an API via `useAsyncData` using a dynamic page parameter - `slug` - as part of the URL.

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

If you need to access the route query parameters (for example `example` in the path `/test?example=true`), then you can use `route.query` instead of `route.params`.

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
