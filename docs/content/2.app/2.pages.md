# Pages

Nuxt will automatically translate your pages directory into the routes of your application.

If you place anything within square brackets, this will be turned into a dynamic route parameter. You can mix and match multiple parameters and even non-dynamic text within a file name or directory.

## Example
```bash
-| pages/
---| index.vue
---| users-[group]/
-----| [userid].vue
```

Given the example above, you can access group/userid within your component via the `$route` object:
```vue
<template>
  {{ $route.params.group }}
  {{ $route.params.id }}
</template>
```
