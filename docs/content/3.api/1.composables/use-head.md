# `useHead`

Nuxt provides a simple composable to easily update the head properties of your page with an object of meta properties with keys corresponding to meta tags:

`title`, `base`, `script`, `style`, `meta` and `link`, as well as `htmlAttrs` and `bodyAttrs`. Alternatively, you can pass a function returning the object for reactive metadata.

```js
useHead({ metaObject })
```

::alert{icon=👉}
**`useHead` only works during `setup`**.
::

## Example

The example below, changes the title of the website in the `meta` and inserts a Google Font using the `link` property.

```js
export default {
  setup () {
    useHead({
      meta: [
        { name: 'title' content: 'Nuxt 3 - The Hybrid Vue Framework' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', crossorigin: '' },
      ]
    })
  }
}
```
