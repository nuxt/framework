# `useRequestEvent`

Nuxt provides composables and utilities for first-class server-side-rendering support.

Within your pages, components, and plugins you can use `useRequestEvent` to access the incoming request.

```js
import { useCookies } from 'h3'

// Get underlying request event
const event = useRequestEvent()

// Get cookies for the event
const cookies = useCookies(event)
```

::alert{icon=👉}
In the browser, `useRequestEvent` will return `undefined`.
::
