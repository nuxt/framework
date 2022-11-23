# `useNuxtData`

`useNuxtData` gives you access to the cache of `useAsyncData`, `useLazyAsyncData`, `useFetch` and `useLazyFetch`.

## Type

```ts
useNuxtData():‌ Recod<string, any>
```

## Examples

### Show stale data while fetching in the background
The example below shows how you can use cached data as a placeholder while the most recent data is being fetched from the server.

```ts
// In Archive.vue
const { data } = await useFetch('/api/posts', {
  key: 'posts', // You need to set a key to access the data later.
})
```

```ts
// In Single.vue
const { data } = await useFetch(`/api/posts/${postId}`, {
  key: `post-${postId}`,
  default: () => {
    // Find the individual post from the cache and set it as the default value.
    return useNuxtData().posts.find(post => post.id === id)
  }
})
```
