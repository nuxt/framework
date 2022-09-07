# `clearNuxtData`

Clears cache of `useAsyncData`, `useLazyAsyncData`, `useFetch` and `useLazyFetch`.

This method is useful if you want to invalidate the data fetching for another page.

```ts
clearNuxtData ({ keys }: {keys: string | string[]})
```

Available options:

* `keys`: Provides an array of keys that are used in `useAsyncData` to delete cached data.
