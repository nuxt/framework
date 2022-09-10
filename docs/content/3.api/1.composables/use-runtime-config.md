# `useRuntimeConfig`

`useRuntimeConfig` composable is used to expose config variables within the Nuxt application on both server-side and client-side.

## Usage

```ts [server/api/foo.ts]
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
})
```

`useRuntimeConfig` provides an `app` object with `baseURL` and `cdnURL` out of the box. However, Nuxt provides the ability to update their values at runtime by setting environment variables in the `.env` file.

## Examples

### Update base URL

By default, the `baseURL` is set to `'/'`.
However, the `baseURL` can be updated at runtime by setting the `NUXT_APP_BASE_URL` as an environment variable in the `.env` file of your Nuxt App.

This is particularly useful when there are multiple environments, such as `development`, `test` and `production`, and they share similar variable names with slightly different values.

``` [.env]
NUXT_APP_BASE_URL = 'https://localhost:5555'
```

Then, you can access this new base URL using `config.app.baseURL`.

```ts [/plugins/my-plugin.ts]
export default defineNuxtPlugin((NuxtApp) => {
  const config = useRuntimeConfig()

  // Access baseURL universally
  const baseURL = config.app.baseURL
})
```

### Set CDN URL

This example shows how to set a custom CDN url and access them using `useRuntimeConfig()`.

By default, the `public/` folder is treated as a static content provider. But you can change that by providing your own CDN url through the environment variable.

First, you set the environment variable `NUXT_APP_CDN_URL` in the `.env` file.

``` [.env]
NUXT_APP_CDN_URL = 'https://cdn.localhost:5555'
```

And then access the new CDN url using `config.app.cdnURL`.

```ts [server/api/foo.ts]
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  
  // Access cdnURL universally
  const cdnURL = config.app.cdnURL
})
```

### Private and public variables

This example below shows how to set base API endpoint url for public access and secret API token for only accessible on the server-side.

- First, you set the environment variable `API_BASE_URL` in the `.env` file.

``` [.env]
API_BASE_URL = 'https://api.localhost:5555'
```

- Then access `API_BASE_URL` within the `nuxt.config` file.

Any environment variables set within `.env` file are accessed using `process.env` in the Nuxt app.

Variables needed to be set during runtime are defined in `runtimeConfig.public: {}`, while the variables needed during build-time are added directly inside `runtimeConfig: {}`.

```ts [/nuxt.config.ts]
export default defineNuxtConfig({
    runtimeConfig: {
        // The private keys are only available on server-side
        apiSecret: '123',

        // The public keys are exposed to the client-side
        public: {
            apiBase: process.env.API_BASE_URL
        }
    }
})
```

- And finally access both public and private variables on server-side as below.

```ts [server/api/test.ts]
export default async () => {
  const config = useRuntimeConfig()
  
  // Access public variables
  const result = await $fetch(`${config.public.apiBase}/test`, {
    headers: {
      // Access private variable
      Authorization: `Bearer ${config.apiSecret}`
    }
  })
  return result
}
```

In this example, since `apiBase` is defined within `public:{}` key, it is universally accessible on both server and client-side, while an `apiSecret` is only accessible on the server-side.

::ReadMore{link="/guide/features/runtime-config"}
::
