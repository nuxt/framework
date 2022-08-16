# `prefetchComponents`

Nuxt provides composables and utilities to give you fine-grained control over prefetching JavaScript in your client application.

You can use `prefetchComponents` to manually prefetch individual components that have been registered globally in your Nuxt app. (By default Nuxt registers these as async components.) You must use the Pascal-cased version of the component name.

`prefetchComponents` can only be called within component setup functions, plugins, and route middleware.

```js
await prefetchComponents('MyGlobalComponent')

await prefetchComponents(['MyGlobalComponent1', 'MyGlobalComponent2'])
```

::alert{icon=👉}
On server, `prefetchComponents` will have no effect.
::
