# `useLazyAsyncData`

## Description

By default, [useAsyncData](/api/composables/use-async-data) blocks navigation until its async handler is resolved.

`useLazyAsyncData` provides a wrapper around `useAsyncData` that triggers navigation before the handler is resolved by setting the `lazy` option to `true`.

> `useLazyAsyncData` has the same signature as `useAsyncData`.

:ReadMore{link="/api/composables/use-async-data"}

## Example

```ts
/* Navigation will occur before fetching is complete.
  Handle pending and error state directly within your component's template
*/
const { data, pending, error, refresh } = await useLazyAsyncData(
  'mountains',
  () => $fetch('https://api.nuxtjs.dev/mountains')
)
```

:ReadMore{link="/guide/features/data-fetching#uselazyasyncdata"}
