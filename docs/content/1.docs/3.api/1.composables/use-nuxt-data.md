# `useNuxtData`

`useNuxtData` gives you access to the cache of `useAsyncData`, `useLazyAsyncData`, `useFetch` and `useLazyFetch`.

## Type

```ts
useNuxtData(key: string):‌ Ref<any>
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
    return useNuxtData('posts').value.find(post => post.id === postId)
  }
})
```

### Optimistic Updates

We can leverage the cache to update the UI after a mutation, while the data is being invalidated in the background.

```ts
// In Todos.vue
const { data } = await useFetch('/api/todos', {
  key: 'todos'
})
```

```ts
// In AddTodo.vue
const newTodo = ref('')
const previousTodos = ref([])

const { data } = await useFetch('/api/addTodo', {
  key: 'addTodo',
  method: 'post',
  body: {
    todo: newTodo.value
  },
  onRequest () {
    previousTodos.value = useNuxtData('todos').value // Store the previously cached value to restore if fetch fails.

    useNuxtData('todos').value.push(newTodo.value) // Optimistically update the todos.
  },
  onRequestError () {
    useNuxtData('todos').value = previousTodos.value // Rollback the data if the request failed.
  },
  async onResponse () {
    await refreshNuxtData('todos') // Invalidate todos in the background if the request succeeded.
  }
})
```
