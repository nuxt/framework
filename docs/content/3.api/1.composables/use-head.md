---
description: useHead customizes the head properties of individual pages of your Nuxt app.
---

# `useHead`

Nuxt provides the `useHead` composable to add and customize the head properties of individual pages of your Nuxt app. It uses [@vueuse/head](https://github.com/vueuse/head) under the hood.

::alert{icon=👉}
`useHead` only works during `setup` or `Lifecycle Hooks`.
::

::ReadMore{link="/getting-started/seo-meta"}
::

## Type

```ts
useHead(meta: MaybeComputedRef<MetaObject>): void
```

See [zhead](https://github.com/harlan-zw/zhead/tree/main/packages/schema/src) for more detailed types.

```ts
interface MetaObject {
  title?: string
  titleTemplate?: string | ((title?: string) => string)
  base?: Base
  link?: Link[]
  meta?: Meta[]
  style?: Style[]
  script?: Script[]
  noscript?: Noscript[];
  htmlAttrs?: HtmlAttributes;
  bodyAttrs?: BodyAttributes;
}
```

Application-wide configuration of the head metadata is possible through [nuxt.config](/api/configuration/nuxt-config#head), or by placing the `useHead` in the `app.vue` file.

::alert{type=info}
The properties of `useHead` can be dynamic, accepting `ref`, `computed` and `reactive` properties. `meta` parameter can also accept a function returning an object to make the entire object reactive.
::

## Parameters

### `meta`

**Type**: `MetaObject`

An object accepting the following head metadata:

- `meta`

  **Type**: `Array<Record<string, any>>`

  Each element in the array is mapped to a newly-created `<meta>` tag, where object properties are mapped to the corresponding attributes.

- `link`

  **Type**: `Array<Record<string, any>>`

  Each element in the array is mapped to a newly-created `<link>` tag, where object properties are mapped to the corresponding attributes.

- `style`

  **Type**: `Array<Record<string, any>>`

  Each element in the array is mapped to a newly-created `<style>` tag, where object properties are mapped to the corresponding attributes.

- `script`

  **Type**: `Array<Record<string, any>>`

  Each element in the array is mapped to a newly-created `<script>` tag, where object properties are mapped to the corresponding attributes.

- `noscript`

  **Type**: `Array<Record<string, any>>`

  Each element in the array is mapped to a newly-created `<noscript>` tag, where object properties are mapped to the corresponding attributes.

- `titleTemplate`

  **Type**: `string` | `((title: string) => string)`

  Configures dynamic template to customize the page title on an individual page.

- `title`

  **Type**: `string`

  Sets static page title on an individual page.

- `bodyAttrs`

  **Type**: `Record<string, any>`

  Sets attributes of the `<body>` tag. Each object property is mapped to the corresponding attribute.

- `htmlAttrs`

  **Type**: `Record<string, any>`

  Sets attributes of the `<html>` tag. Each object property is mapped to the corresponding attribute.

## Examples

### Usage With `definePageMeta`

Within your `pages/` directory, you can use `definePageMeta` along with `useHead` to set metadata based on the current route.

For example, you can first set the current page title (this is extracted at build time via a macro, so it can't be set dynamically):

```vue{}[pages/some-page.vue]
<script setup>
definePageMeta({
  title: 'Some Page'
})
</script>
```

And then in your layout file, you might use the route's metadata you have previously set:

```vue{}[layouts/default.vue]
<script setup>
const route = useRoute()

useHead({
  meta: [{ name: 'og:title', content: `App Name - ${route.meta.title}` }]
})
</script>
```

:LinkExample{link="/examples/composables/use-head"}

:ReadMore{link="/guide/directory-structure/pages/#page-metadata"}

### Add Dynamic Title

In the example below, `titleTemplate` is set either as a string with the `%s` placeholder or as a `function`, which allows greater flexibility in setting the page title dynamically for each route of your Nuxt app:

```vue [app.vue]
<script setup>
  useHead({
    // as a string,
    // where `%s` is replaced with the title
    titleTemplate: '%s - Site Title',
    // ... or as a function 
    titleTemplate: (productCategory) => {
      return productCategory
        ? `${productCategory} - Site Title`
        : 'Site Title'
    }
  })
</script>
```

`nuxt.config` is also used as an alternative way of setting the page title. However, `nuxt.config` does not allow the page title to be dynamic. Therefore, it is recommended to use `titleTemplate` in the `app.vue` file to add a dynamic title, which is then applied to all routes of your Nuxt app.

### Add Third-party Scripts

The example below inserts a third-party script using the `script` property of the `useHead` composable:

```vue
<script setup>
  useHead({
    script: [
      {
        src: 'https://third-party-script.com',
        body: true
      }
    ]
  })
</script>
```

You can use the `body: true` option to add the above script at the end of the `<body>` tag.

:ReadMore{link="/guide/features/head-management"}

### Add External CSS

The example below inserts Google Fonts using the `link` property of the `useHead` composable:

```vue
<script setup>  
  useHead({
    link: [
      { 
        rel: 'preconnect', 
        href: 'https://fonts.googleapis.com'
      },
      { 
        rel: 'stylesheet', 
        href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', 
        crossorigin: '' 
      }
    ]
  })
</script>
```
