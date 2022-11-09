---
title: "useRequestHeaders"
description: "Use useRequestHeaders to access the incoming request headers."
---

# `useRequestHeaders`

You can use built-in `useRequestHeaders` composable to access the incoming request headers within your pages, components, and plugins.

```js
// Get all request headers
const headers = useRequestHeaders()

// Get only cookie request header
const headers = useRequestHeaders(['cookie'])
```

::alert{icon=👉}
In the browser, `useRequestHeaders` will return an empty object.
::

## Example

We can use `useRequestHeaders` to access and proxy browser's `authorization` header to the server-side and also make sure that there are no unintended side effects during SSR.

The example below adds an `authorization` request headers to an isomorphic `$fetch` call.

```vue [pages/some-page.vue]
<script setup>
const { data } = await useFetch('/api/confidential', {
  headers: useRequestHeaders(['authorization'])
})
</script>
```

::alert{icon=👉}
[Another example](/getting-started/data-fetching#example-pass-client-headers-to-the-api) shows how we can pass `cookie` from the client headers to the API.
::
