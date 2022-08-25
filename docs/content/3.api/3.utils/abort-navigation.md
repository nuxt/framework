# `abortNavigation`

`abortNavigation` is a helper function that prevents the navigation from taking place.

## Usage

```ts
abortNavigation(err?: Error | string): false
```

`abortNavigation` takes one optional argument which can be of type `string` or an `Error` object.

- **err**: Optional error to be thrown by `abortNavigation()`.

::alert{type="warning"}
`abortNavigation()` is only usable inside a [route middleware handler](/guide/directory-structure/middleware).
::

Inside a route middleware handler, `abortNavigation()` will abort navigation, and throw an error if one is set as a parameter.

## Examples

The example below shows how you can use `abortNavigation` in route middleware to prevent unauthorised route access.

```jsx
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
 const user = useState('user')
 if (!user.value.isAuthorized) {
    abortNavigation()
  }
 return navigateTo('/edit-post')
})
```

### `err` as a string

You can pass the error as a `string`.

```ts [middleware/auth.ts]
export default defineNuxtRouteMiddleware((to, from) => {
 const auth = useState('auth')
 if (!user.value.isAuthorized) {
    abortNavigation('This feature requires special permission.')
  }
})
```

### `err` as an Error object

You can pass the error as an `Error` object that includes the error code and a message.

```ts [middleware/auth.ts]
export default defineNuxtRouteMiddleware((to, from) => {
 const auth = useState('auth')
 if (to.params.id === '1') {
    abortNavigation({ 
       statusCode: 401, 
       statusMessage: "This feature requires special permission." 
  })
  }
})
```

::ReadMore{link="/guide/features/routing"}
::
