# `useLazyFetch`

## Description

By default, [useFetch](/api/composables/use-fetch) blocks navigation until its async handler is resolved.

`useLazyFetch` provides a wrapper around `useFetch` that triggers navigation before the handler is resolved by setting the `lazy` option to `true`.

> `useLazyFetch` has the same signature as `useFetch`.

:ReadMore{link="/api/composables/use-fetch"}

## Example

```ts
/* Navigation will occur before fetching is complete.
  Handle pending and error state directly within your component's template
*/
const { data, pending, error, refresh } = await useLazyFetch('https://api.nuxtjs.dev/mountains')
```

:ReadMore{link="/guide/features/data-fetching#uselazyfetch"}
