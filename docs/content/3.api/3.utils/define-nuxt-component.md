# `defineNuxtComponent`

`defineNuxtComponent()` is a helper function for defining type safe Vue components within a Nuxt application. `defineNuxtComponent()` is a wrapper around [defineComponent()](https://vuejs.org/api/general.html#definecomponent) function that supports inferring the props passed to `setup()` function when we use Composition API without `<script setup>`.

`defineNuxtComponent()` also takes care of resolving the promise returned by `useAsyncData()` in Vue components found at `components/` and `pages/` directory or in the `~/app.vue` component found at the root of your Nuxt application.

Any Vue 3 components written in Nuxt application without `<script setup lang=“ts”>` can use `defineNuxtComponent()` helper function to leverage the benefits of TypeScript.

## Example

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
