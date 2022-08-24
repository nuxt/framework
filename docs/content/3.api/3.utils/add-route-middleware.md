# `addRouteMiddleware`

`addRouteMiddleware()` is a helper function to dynamically add route middleware in your Nuxt application.

::alert{type=info}
Route middleware are navigation guards and are generally stored in the [`middleware/`](/guide/directory-structure/middleware) directory of your Nuxt application.
::

## Usage

```js
addRouteMiddleware (name: string | RouteMiddleware, middleware?: RouteMiddleware, options: AddRouteMiddlewareOptions = {})
```

`addRouteMiddleware()` takes three arguments:

- **name** `type: string | RouteMiddleware`

`name` can either be a `string` or a function of type `RouteMiddleware`. This function provides the next route `to` as the first argument and the current route `from` as the second argument. Both `to` and `from` are Vue route objects.

Learn more about available properties found on [route objects](/api/composables/use-route).

- **middleware**: `type: RouteMiddleware`

The second argument is also a function of type `RouteMiddleware` but it is optional. Same as mentioned above, this function provides `to` and `from` route objects. This argument becomes optional if the first argument in `addRouteMiddleware()` is already passed as a function.

- **options:** `type: AddRouteMiddlewareOptions`  

An optional `options` argument lets you set the value of `global` to `true` to indicate whether the router middleware is global or not (set to `false` by default).

## Examples

### Inline route middleware

Inline route middleware is anonymous because it does not have a name. `function` is passed as the first argument and therefore the second argument of `middleware` becomes redundant.

```js [plugins/my-plugin.ts]
export default defineNuxtPlugin(() => {
  addRouteMiddleware((to, from) => {
    if (to.path === '/forbidden') {
      return false
    }
  })
})
```

### Named route middleware

Named route middleware always takes the first argument as a `string` and the second argument as a `function`.

Named route middleware defined through a plugin like this overrides any existing middleware of the same name located in the `/middleware` directory.

```js [plugins/my-plugin.ts]
export default defineNuxtPlugin(() => {
  addRouteMiddleware('named-middleware', () => {
    console.log('named middleware added in Nuxt plugin')
  })
})
```

### Global route middleware

You can also set  an optional, third argument `{ global: true }` to indicate whether the route middleware being defined is `global`.

```js [plugins/my-plugin.ts]
export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-middleware', (to, from) => {
      console.log('global middleware that runs on every route change')
    }, 
 { global: true })
})
```

::ReadMore{link="/guide/features/routing"}
::
