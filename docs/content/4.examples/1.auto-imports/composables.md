---
template: Example
---

# Composables auto-import

This example shows how to use the `composables/` directory to auto import composables.
If the component file provides a default export, the name of the composable will be mapped to the name of the file. Named exports can be used as-is.

::alert{type=info icon=👉}
Read more about [the composables directory](/docs/directory-structure/composables).
::

::sandbox{repo="nuxt/framework" branch="main" dir="examples/composables" file="app.vue"}
