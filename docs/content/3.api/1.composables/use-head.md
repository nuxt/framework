# `useHead`

Nuxt provides `useHead` composable to add and customize the head properties of individual pages of Nuxt app. `useHead` uses [@vueuse/head](https://github.com/vueuse/head) underneath and unlike [definePageMeta](/api/utils/define-page-meta), properties of `useHead` can be dynamic and can accept a function returning the object with reactive metadata.

`useHead` accepts properties of type `MetaObject` as listed below.

## Type

```js [Signature]
useHead(options: MetaObject)

interface MetaObject extends Record<string, any> {
  charset?: string
  viewport?: string
  meta?: Array<Record<string, any>>
  link?: Array<Record<string, any>>
  style?: Array<Record<string, any>>
  script?: Array<Record<string, any>>
  noscript?: Array<Record<string, any>>
  titleTemplate?: string | ((title: string) => string)
  title?: string
  bodyAttrs?: Record<string, any>
  htmlAttrs?: Record<string, any>
}
```

Application-wide configuration of the same properties listed above is possible through [nuxt.config](/api/configuration/nuxt.config#head). However, `useHead` composable allows customizing these properties at page-level.

::alert{icon=👉}
**`useHead` only works during `setup`**.
::

## Properties

* **charset**: `type: string` | `default: 'utf-8'` - Character encoding in which the document is encoded

* **viewport**: `type: string` | `default: 'width=device-width, initial-scale=1'` - Configure the viewport (the area of the window in which web content can be seen)

* **meta**: `type: array` - Each item in meta array maps to a newly-created `<meta>` element, where object properties map to attributes.

* **link**: `type: array` - Each item maps to a newly-created `<link>` element, where object properties map to attributes.

* **style**: `type: array` - Each item maps to a newly-created `<style>` element, where object properties map to attributes.

* **script**: `type: array` - Each item maps to a newly-created `<script>` element, where object properties map to attributes.

* **noscript**: `type: array` - Each item maps to a newly-created `<noscript>` element, where object properties map to attributes.

* **titleTemplate**: `type: string | function` - Configure dynamic template to customise page title on individual page

* **title**: `type: string` - Provide static page title for Nuxt application

* **bodyAttrs**: `type: Record` - Keys in `bodyAttrs` can be `class`, `id` or `inheritAttrs`. See the full [list of keys](https://github.com/nuxt/framework/blob/main/packages/schema/src/types/meta.ts) available to add as key-value pairs in `bodyAttrs`.

* **htmlAttrs**: `type: Record` - Keys in `htmlAttrs` can be `class`, `id`, `manifest`, `version` or `xmlns`. See the full [list of keys](https://github.com/nuxt/framework/blob/main/packages/schema/src/types/meta.ts) available to add as key-value pairs in `htmlAttrs`.

> All elements in the meta object are optional. You can also pass only single values.

## Examples

### Customize metadata

The example below changes the website's `title` and `description` using `meta` option within `useHead` composable.

```vue
<script setup>
  const title = ref('My App')
  const description = ref('My amazing Nuxt app')
  useHead({
    title,
    meta: [{
      name: 'description',
      content: description
    }]
  })
</script>
```

### Add dynamic title

In the example below, `titleTemplate` is set as a `function` to have full control over setting dynamic title for each route of your Nuxt app.

```vue [app.vue]
<script setup>
  useHead({
    // as a string
    // `%s` is replaced with the title
    titleTemplate: '%s - Site Title',
    // or as a function 
    titleTemplate: (productCategory) => {
      return productCategory ? `${productCategory} - Site Title` : 'Site Title';
    }
  })
</script>
```

`nuxt.config` is also used as an alternative to set the page title. However, `nuxt.config` does not allow the page title to be dynamic. Therefore, it is recommended to use `titleTemplate` in `app.vue` file to add dynamic title which is then applied to all routes of your Nuxt app.

### Add external CSS

The example below inserts Google Fonts using the `link` property of `useHead` composable.

```vue [app.vue]
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
      },
    ]
  })
</script>
```

### Add third-party script

The example below inserts third-party JavaScript using the `script` property of the `useHead` composable.

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

You can use the `body: true` option on `script` meta tags to add script at the end of the `<body>` tag.

::ReadMore{link="/guide/features/head-management"}
