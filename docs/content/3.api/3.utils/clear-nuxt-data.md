# `clearNuxtData`

::StabilityEdge
::

Delete cached data, error status and pending promises of `useAsyncData` and `useFetch`.

This method is useful if you want to invalidate the data fetching for another page.

## Type

```ts
clearNuxtData (keys?: string | string[])
```

## Parameters

* `keys`: Provides an array of keys that are used in `useAsyncData` to delete cached data.
