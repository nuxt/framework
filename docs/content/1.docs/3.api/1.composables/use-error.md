---
title: "useError"
description: useError composable returns the global Nuxt error that is being handled.
---

# `useError`

`useError` composable returns the global Nuxt error that is being handled and it is available on both client and server.

```ts
const error = useError()
```

`useError` sets an error in the state and creates a reactive as well as SSR-friendly global Nuxt error across components. Nuxt errors have the following properties:

## Properties

- **statusCode**

  Type: `Number`

  HTTP response status code

- **statusMessage**

  Type: `String`

  HTTP response status message

- **message**

  Type: `String`

  Error message

## Example

### customize default 404 error message

The example below shows how you can customize the default `error` message using `useError` composable.

You can customize the default error page by adding `~/error.vue` in the root of your application, alongside `app.vue`. `error` props is available by default on this `error.vue` file as shown below.

```vue [/error.vue]
<script setup>
  // default props available on error.vue
  const props = defineProps({
    error: Object,
  })
</script>
```

Since it is not the best practice to update `props` directly within the Vue component, you should not update the `error` object directly.

Instead, you can use `useError` composable to set the `error` object in the state while maintaining its reactive properties and update the default error message as shown below.

```vue [/error.vue]
<script setup>
  // customise 404 message
  const error = useError();
  if (error.value.statusCode === 404) {
    error.value.message = 'Oops! Page not found 😔';
  }
</script>
```

::ReadMore{link="/docs/getting-started/error-handling"}
::
