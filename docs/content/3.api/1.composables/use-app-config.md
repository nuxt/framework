# `useAppConfig`

::StabilityEdge
::

Access [app config](/guide/features/app-config):

**Usage:**

```js
// Access whole app config (reactive object)
const appConfig = useAppConfig()

// Access sub key of app-config (still reactive)
const themeConfig = useAppConfig('theme')
```

::ReadMore{link="/guide/features/app-config"}
