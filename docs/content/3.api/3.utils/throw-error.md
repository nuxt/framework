# `throwError`

Nuxt provides a quick and simple way to throw errors.

Within your pages, components and plugins you can use `throwError` to throw an error.

**Parameters:**

- `error`: `string | Error | Partial<{ cause, data, message, name, stack, statusCode, statusMessage }>`

```js
throwError("😱 Oh no, an error has been thrown.")
throwError({ statusCode: 404, statusMessage: "Page Not Found" })
```

The thrown error is set in the state using [`useError()`](/api/composables/use-error) to create a reactive and SSR-friendly shared error state across components.

`throwError` calls the `app:error` hook.

::ReadMore{link="/guide/features/error-handling"}
::

## Throwing errors in API routes

You can use the auto-imported `createError` from [`h3`](https://github.com/unjs/h3) package to trigger error handling in server API routes.

**Example:**

```js
export default eventHandler(() => {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found'
  })
}
```
