# `navigateTo`

`navigateTo` is a route helper function that allows creating programmatic navigation for users to navigate within Nuxt application.

`navigateTo` is available on both server side and client side. It can be used within plugins, middleware or can be called directly to perform page navigation.

> While using `navigateTo`, make sure to use `await` or chain its result by returning from functions.

## Required parameter

`navigateTo` takes route as a required parameter that can be a plain string or a route object.

- **route:** type: string | Route

### Example: Vue component

```js
<script setup>    
// string
return navigateTo('/search')

// route object
return navigateTo({ path: '/search' })

// route object with query parameters
return navigateTo({
    path: '/search',
    query: {
        name: name.value,
        type: type.value
    }
})
</script>
```

## Optional parameters

- **redirectCode:** type: number

`navigateTo` redirects to the given path and sets the redirect code to `302` by default when the redirect takes place on the server side. 

This default behavior can be modified by providing different `redirectCode` as an optional parameter.

### Example: Route middleware

```js
export default defineNuxtRouteMiddleware((to, from) => {
  // set the redirect code to 301 Moved Permanently
  return navigateTo('/search', { redirectCode: 301 })
})
```

- **replace:** type: boolean

By default, `navigateTo` pushes the given route into Vue router instance.

This behavior can be changed by setting `replace` to `true`, to indicate that given route should be replaced.

```js
<script setup>
    await navigateTo('/', { replace: true })
</script>
```

::ReadMore{link="/guide/features/routing"}
::
