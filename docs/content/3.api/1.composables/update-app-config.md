# `updateAppConfig`

::StabilityEdge
::

Updates [app config](/guide/going-further/app-config) using deep assignment. Existing (nested) properties will be preserved.

**Usage:**

```js
const appConfig = useAppConfig() // { foo: 'bar' }

const newAppConfig = { foo: 'baz' }

updateAppConfig(newAppConfig)

console.log(appConfig) // { foo: 'baz' }
```

::ReadMore{link="/guide/going-further/app-config"}
