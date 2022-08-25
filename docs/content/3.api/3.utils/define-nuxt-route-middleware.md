# `defineNuxtRouteMiddleware`

You can create named route middleware using `defineNuxtRouteMiddleware`  helper function.

Route middleware are generally stored in the `middleware/` directory unless otherwise customized using [nuxt.config](/api/configuration/nuxt.config#middleware).

## Usage

```ts
export default defineNuxtRouteMiddleware((middleware: RouteMiddleware) => {})
```

### Parameters

`defineNuxtRouteMiddleware` provides parameter of type `RouteMiddleware` which includes two Vue route objects:

- **to:** `type: RouteMiddleware` - `to` is the first argument that return the next route

- **from:** `type: RouteMiddleware` - `from` is the second argument that returns the current route

Learn more about available properties of **[route objects](https://v3.nuxtjs.org/api/composables/use-route)** .

## Examples

### Show error page

You can use route middleware to throw errors and show helpful error messages.

```ts [middleware/error.ts]
export default defineNuxtRouteMiddleware((to) => {
  if (to.params.id === '1') {
    showError({ statusCode: 404, statusMessage: "Page Not Found" })
  }
})
```

Above route middleware will take user on a custom error page defined at `~/error.vue` and show error message and code as passed from the middleware.

### Redirection

The route middleware below shows how you can use `useState` in combination with `navigateTo` helper method to redirect users on different routes based on their authentication status.

```ts [middleware/auth.ts]
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useState('auth')
  
  if (!auth.value.authenticated) {
    return navigateTo('/login')
  }
  return navigateTo('/dashboard')
})
```

Both [navigateTo](/api/utils/navigate-to) and [abortNavigation](/api/utils/abort-navigation) are globally available helper methods that you can use inside `defineNuxtRouteMiddleware` helper function.

::ReadMore{link="/guide/features/routing"}
::
