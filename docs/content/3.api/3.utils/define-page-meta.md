---
title: "definePageMeta"
---

# `definePageMeta`

`definePageMeta` is a compiler macro that you can use to set metadata for your **page** components located in the `pages/` directory (unless [set otherwise](https://v3.nuxtjs.org/api/configuration/nuxt-config#pages)). This way you can set custom metadata for each static or dynamic route of your Nuxt application.

```vue [pages/some-page.vue]
<script setup>
  definePageMeta({
    title: 'Articles'
  })
</script>
```

::ReadMore{link="/guide/directory-structure/pages/#page-metadata"}
::

## Type

```ts
definePageMeta(meta: PageMeta) => void

interface PageMeta {
  validate?: (route: RouteLocationNormalized) => boolean | Promise<boolean> | Partial<NuxtError> | Promise<Partial<NuxtError>>
  redirect?: RouteRecordRedirectOption
  alias?: string | string[]
  pageTransition?: boolean | TransitionProps
  layoutTransition?: boolean | TransitionProps
  key?: false | string | ((route: RouteLocationNormalizedLoaded) => string)
  keepalive?: boolean | KeepAliveProps
  layout?: false | LayoutKey | Ref<LayoutKey> | ComputedRef<LayoutKey>
  middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  [key: string]: any
}
```

## Parameters

### `meta`

- **Type**: `PageMeta`

  An object accepting the following page metadata:

  **`pageTransition`**
  
  - **Type**: `boolean` | [`TransitionProps`](https://vuejs.org/api/built-in-components.html#transition)
  
    Set name of the transition to apply for current page. You can also set this value to `false` to disable the page transition.

  **`layoutTransition`**

  - **Type**: `boolean` | [`TransitionProps`](https://vuejs.org/api/built-in-components.html#transition)

    Set name of the transition to apply for current layout. You can also set this value to `false` to disable the layout transition.

  **`key`**

  - **Type**: `false` | `string` | `((route: RouteLocationNormalizedLoaded) => string)`

    Set `key` value when you need more control over when the `<NuxtPage>` component is re-rendered.

  **`keepalive`**

  - **Type**: `boolean` | [`KeepAliveProps`](https://vuejs.org/api/built-in-components.html#keepalive)

    Set to `true` when you want to preserve page state across route changes or use the [`KeepAliveProps`](https://vuejs.org/api/built-in-components.html#keepalive) for a fine-grained control.

  **`layout`**

  - **Type**: `false` | `LayoutKey` | `Ref<LayoutKey>` | `ComputedRef<LayoutKey>`

    Set a static or dynamic name of the layout for each route. This can be set to `false` in case the default layout needs to be disabled.

  **`middleware`**

  - **Type**: `MiddlewareKey` | [`NavigationGuard`](https://router.vuejs.org/api/interfaces/NavigationGuard.html#navigationguard) | `Array<MiddlewareKey | NavigationGuard>`

    Define anonymous or named middleware directly within `definePageMeta`. Learn more about [route middleware](/docs/directory-structure/middleware).

  **`validate`**

  - **Type**: `(route: RouteLocationNormalized) => boolean | Promise<boolean> | Partial<NuxtError> | Promise<Partial<NuxtError>>`

    Validate whether a given route can validly be rendered with this page. Return true if it is valid, or false if not. If another match can't be found, this will mean a 404. You can also directly return an object with `statusCode`/`statusMessage` to respond immediately with an error (other matches will not be checked).

    :StabilityEdge

  **`[key: string]`**

  - **Type**: `any`

    Apart from the above properties, you can also set **custom** metadata. You may wish to do so in a type-safe way by [augmenting the type of the `meta` object](/guide/directory-structure/pages/#typing-custom-metadata).

## Examples

### Basic Usage

The example below demonstrates:

- how `key` can be a function that returns a value;
- how `keepalive` property makes sure that the `<modal>` component is not cached when switching between multiple components;
- adding `pageType` as a custom property:

```vue [pages/some-page.vue]
<script setup>
  definePageMeta({
    key: (route) => route.fullPath,

    keepalive: {
      exclude: ['modal']
    },

    pageType: 'Checkout'
  })
</script>
```

### Defining Middleware

The example below shows how the middleware can be defined using a `function` directly within the `definePageMeta` or set as a `string` that matches the middleware file name located in the `middleware/` directory:

```vue [pages/some-page.vue]
<script setup>
  definePageMeta({
    // define middleware as a function
    middleware: [
      function (to, from) {
        const auth = useState('auth')
        
        if (!auth.value.authenticated) {
            return navigateTo('/login')
        }
        
        return navigateTo('/checkout')
      }
    ],

    // ... or a string
    middleware: 'auth'
    
    // ... or multiple strings
    middleware: ['auth', 'another-named-middleware']
})
</script>
```

### Defining Layout

You can define the layout that matches the layout's file name located (by default) in the `layouts/` directory. You can also disable the layout by setting the `layout` to `false`:

```vue [pages/some-page.vue]
<script setup>
  definePageMeta({
    // set custom layout
    layout: 'admin'
    
    // ... or disable a default layout
    layout: false
  })
</script>
```
