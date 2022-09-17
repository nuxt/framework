# `defineNuxtComponent`

`defineNuxtComponent()` is a helper function for defining type safe Vue components within a Nuxt application.

`defineNuxtComponent()` is a wrapper around [defineComponent()](https://vuejs.org/api/general.html#definecomponent) function that supports inferring the props passed to `setup()` function when we use Composition API without `<script setup>`.

## `useAsyncData`

`defineNuxtComponent()` also takes care of resolving the promise returned by `useAsyncData()` in Vue components found at `components/` and `pages/` directory or in the `~/app.vue` component found at the root of your Nuxt application.

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

## `asyncData`

Taking Composition API into account, using `<script setup lang=“ts”>` is the recommended way of declaring Vue components in Nuxt 3.

However, if page components in your Nuxt 3 project still use `asyncData()` hook of the Options API, then you can use `defineNuxtComponent()` helper function to leverage the benefits of TypeScript.

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
