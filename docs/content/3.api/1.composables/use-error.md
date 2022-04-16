# `useError`

Nuxt provides a composable to catch global errors.

This function will return the global Nuxt error that is being handled.

```ts
const error = useError()
```

`useError` sets an error in the state and creates a reactive and SSR-friendly global Nuxt error across components.

::ReadMore{link="/guide/features/error-handling"}
::
