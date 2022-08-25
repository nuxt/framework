# `setLayout`

`setLayout` allows you to dynamically change the layout of a page.

`setLayout` relies on access to the Nuxt context and can only be called within component setup functions, plugins, and route middleware.

```js
export default defineNuxtRouteMiddleware(to => {
  // Set the layout on the route you are navigating _to_
  setLayout('other')
})
```

::alert{icon=👉}
If you choose to set the layout dynamically on the server-side, you _must_ do so before the layout is rendered by Vue. (In other words, within a plugin or route middleware.) Otherwise there will be a hydration mismatch.
::
