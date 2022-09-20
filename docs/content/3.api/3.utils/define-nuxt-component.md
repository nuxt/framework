# `defineNuxtComponent`

`defineNuxtComponent()` is a helper function for defining type safe Vue components using options API similar to [defineComponent()](https://vuejs.org/api/general.html#definecomponent). `defineNuxtComponent()` wrapper also adds support for `asyncData` component option.

::alert{type=warning}
Options API support for `asyncData` may well change before the stable release of Nuxt 3.
::

::Alert
Using `<script setup lang="ts">` is the recommended way of declaring Vue components in Nuxt 3.
::

:ReadMore{link=/getting-started/data-fetching#options-api-support}

## `asyncData()`


If you choose to use options API to define components in your Nuxt 3, you can use `asyncData()` utility:

```vue [pages/index.vue]
<script lang="ts">
export default defineNuxtComponent({
  asyncData() {
    return {
      data: {
        greetings: 'hello world!'
      }
    }
  },
  async setup(props) {
    // ...
  }
})
</script>
```

## `setup` function

`defineNuxtComponent()` also takes care of resolving the promise returned by `useAsyncData()` in Vue components found at `components/` and `pages/` directory, or in the `~/app.vue` component found at the root of your Nuxt application:

```vue [pages/index.vue]
<script lang="ts">
export default defineNuxtComponent({
  async setup(props) {
    const { data } = await useAsyncData(() => Promise.resolve('Hello world!'))

    return {
      data
    }
  }
})
</script>
```
