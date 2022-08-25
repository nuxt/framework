# `definePageMeta`

`definePageMeta` is a compiler macro that you can use to set metadata for each **page** component located in the `pages/` directory. This way you can set custom metadata for each static or dynamic route of your Nuxt application.

::ReadMore{link="/guide/directory-structure/pages"}
::

## Usage

```vue [pages/some-page.vue]
<script setup>
  definePageMeta({
    title: 'Articles'
  })
</script>
```

> `definePageMeta` works in both `<script setup>` and `<script>`.

## Properties

You can set following properties through `definePageMeta` .

- **title** - `string`

Set custom title for each route of your application

- **key** - `string | function`

Set `key` value when you need more control over when the `<NuxtPage>` component is re-rendered.

- **layout** - `boolean | string`  

Set a static or dynamic name of the layout for each route. This can be set to `false` as well in case the default layout needs to be disabled.

- **middleware**: `string | function`

Define anonymous or named middleware directly within `definePageMeta` under `middleware` key. Learn more about [route middleware](/docs/directory-structure/middleware/).

- **layoutTransition**: `boolean | TransitionProps`

Set name of the transition to apply for current layout. You can also set this value to `false` to disable the layout transition.
(Learn more about [TransitionProps](https://github.com/vuejs/vue/blob/main/src/platforms/web/runtime/components/transition.ts)).

- **pageTransition**: `boolean | TransitionProps`

Set name of the transition to apply for current page. You can also set this value to `false` to disable the page transition.

- **alias**: `string | string[]`

Set alias to access the same page from different paths. Learn more about [alias](https://router.vuejs.org/guide/essentials/redirect-and-alias.html#alias)

- **keepalive**: `boolean | KeepAliveProps`

Set to `true` when you want to preserve page state across route changes. Learn more about [KeepAlive](https://vuejs.org/api/built-in-components.html#keepalive).

Apart from the above values, you can also set **custom** values in `definePageMeta` as well, depending on your use-case. This data can then be accessed throughout your Nuxt application using the `route.meta` object as shown below.

```vue [pages/some-page.vue]
<script setup>
  const route = useRoute()
  console.log(route.meta.title)
</script>
```

## Examples

### Basic usage

The example below shows how `key` can be a function that returns a value, while `pageType` is a custom property and `keepalive` property makes sure that the `modal` component is not cached when you change pages.

```vue [pages/some-page.vue]
<script setup>
  definePageMeta({
    title: 'Checkout home page',
    key: route => route.fullPath,

    keepalive: {
      exclude: ['modal']
    },

    // custom property: pageType
    pageType: 'Checkout'
  })
</script>
```

### Define middleware

The example below shows how the middleware can be defined using a `function` directly within the `definePageMeta` or set as a `string` that matches the middleware file name located in the `middleware/` directory.

```vue [pages/some-page.vue]
<script setup>
  definePageMeta({

    // function
    middleware: [
      async function (to, from) {
        const auth = useState('auth')
        if (!auth.value.authenticated) {
            return navigateTo('/login')
        }
       return navigateTo('/checkout')
      }
    ],

    // string
    // middleware: ['auth']
    // or middleware: 'auth'
})
</script>
```

### Define layout

You can set the `layout` as a `string` value that matches the layout file located in `layouts/` directory. You can disable the layout by setting the `layout` to `false`.

```vue [pages/some-page.vue]
<script setup>
  function applyCustomLayout () {
    route.meta.layout = 'custom'
  }

  definePageMeta({
    layout: false
    // or layout: 'custom'
  })
</script>
```

::ReadMore{link="/guide/features/routing"}
::
