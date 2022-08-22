# `useNuxtApp`

`useNuxtApp` is a built-in composable that provides a shared runtime context, which is available on both client and server side. It helps you access the Vue instance, runtime hooks, runtime config variables and internal states, such as `ssrContext` and `payload`.

You can use `useNuxtApp` within composables, plugins and components.

```vue [app.vue]
<script setup>
  const nuxtApp = useNuxtApp()
</script>
```

`useNuxtApp` exposes the following properties that you can use to extend and customize your app and share state, data and variables.

## globalName

**`type: string`**

`globalName` allows you to customize the global ID used in the main HTML template, as well as the main Vue instance name and other options.

The default value of `globalName` is set to `nuxt`, but you can customize it using `nuxtApp.globalName`.

### Example

```vue [app.vue]
<script setup>
  const nuxtApp = useNuxtApp()
  console.log(nuxtApp.globalName) // nuxt
</script>
```

## isHydrating

**`type: boolean`**

You can use `nuxtApp.isHydrating` to check if the Nuxt app is hydrating on the client side.

### Example

```ts [components/nuxt-error-boundary.ts]
export default defineComponent({
  setup (_props, { slots, emit }) {
    // ...
    const nuxtApp = useNuxtApp()
    onErrorCaptured((err) => {
      if (process.client && !nuxtApp.isHydrating) {
        emit('error', err)
        error.value = err
        return false
      }
    })
    // ...
  }
})
```

## ssrContext

`ssrContext` is generated using runtime `vue-bundle-renderer` for Vue 3 and it is only available on the server-side. Nuxt exposes the following properties through `ssrContext`.

- **url** - `type: string` - `url` refers to the host url where the current request is being made
- **event** - `type: HTTP request` - `event` allows access to `res` and `res` object for the current request made to Nuxt page
- **runtimeConfig** - `type: runtimeConfig object` - `runtimeConfig` exposes runtime config on the client-side via payload
- **noSSR**  - `type: boolean`
- **error** - `type: error object` - returns server-side error if any
- **payload** - returns NuxtApp payload object - See [payload](#payload) section below for more detail.
- **renderMeta** - `type: NuxtMeta` - returns a `Promise` of `NuxtMeta` type that includes HTML, head and body attributes as well as head tags.
- **teleports** - `type: Record object` - renders content outside of the Vue application

> See how the [Vue-meta plugin](https://github.com/nuxt/framework/blob/main/packages/nuxt/src/head/runtime/lib/vue-meta.plugin.ts#L23) on Nuxt uses `renderMeta` in combination with `teleports`.

## vueApp

`vueApp` is the global Vue application instance that you can access through `nuxtApp`.

- **component** - Registers a global component if passing both a name string and a component definition, or retrieves an already registered one if only the name is passed.
- **config** - exposes a `config` object that contains the configuration settings for that application.
- **directive** - Registers a global custom directive if passing both a name string and a directive definition, or retrieves an already registered one if only the name is passed.

> See `directive` example: [https://v3.nuxtjs.org/guide/directory-structure/plugins#vue-directives](https://v3.nuxtjs.org/guide/directory-structure/plugins#vue-directives)

- **mixins** - Applies a global `mixin` (scoped to the application). However, it is not recommended to use mixins with the Vue 3. Their sole purpose is only to provide backward compatibility.
- **mount** - Mounts the application instance in a container element.
- **provide** - Provide a value that can be injected in all descendent components within the application.
- **unmount** - Unmounts a mounted application instance, triggering the unmount lifecycle hooks for all components in the application's component tree.
- **use** - Installs a **[plugin](https://vuejs.org/guide/reusability/plugins.html)**.

> See `use` example: [https://v3.nuxtjs.org/guide/directory-structure/plugins#vue-plugins](https://v3.nuxtjs.org/guide/directory-structure/plugins#vue-plugins)

:ReadMore{link="https://vuejs.org/api/application.html#application-api"}

## $router

**`type: router object`**

You can access the Vue router object using `nuxtApp.$router`.

:ReadMore{link="/api/composables/use-router"}

## provide - fn

`nuxtApp` is a runtime context that you can extend using [Nuxt Plugins](https://v3.nuxtjs.org/guide/directory-structure/plugins). You can use the `provide` function to create Nuxt plugins to make values and helper methods available in your Nuxt application across all composable and components.

`provide` function accepts `name` and `value` parameters.

### Example

```js
const nuxtApp = useNuxtApp()
nuxtApp.provide('hello', (name) => `Hello ${name}!`)

// Prints "Hello name!"
console.log(nuxtApp.$hello('name')) 
```

As you can see in the example above, `$hello` has become the new and custom part of `nuxtApp` context and it is available at all places where `nuxtApp` is accessible.

## State and variables

### $config

`nuxtApp.$config` exposes runtime-config and environment variables on the client-side to the Nuxt app context through two keys: `app` and `public`.

Keys found under `app` and `public` are available on the client-side.

- **app:**
  - **baseURL** - `type: string`
  - **buildAssetsDir** - `type: string`
  - **cdnURL** - `type: string`
- **public** - `nuxtApp.$config.public` allows you to access the public runtime config that is set in the `nuxt.config` file of your Nuxt app.

> Same `$config` object is accessible through `nuxtApp.payload.config` as well.

### payload

`payload` exposes data and state variables from server-side to client-side and make them available in the `window.NUXT` object that is accessible from the browser.

`payload` exposes following keys on client-side after they are stringified and passed from the server-side:

- **serverRendered** - `type: boolean`
- **data** - `type: record object` - when you fetch the data from an API endpoint using either `useFetch` or `useAsyncData`, resulting payload can be accessed from the `payload.data` . This data is cached and helps you prevent fetching the same data in case an identical request is made twice.

```vue [app.vue]
export default defineComponent({
  async setup() {
    const { data } = await useAsyncData('count', () => $fetch('/api/count'))
  }
})
```

After fetching the value of `count` using `useAsyncData` in the example above, if you access `payload.data`, you will see `{ count: 1 }` recorded there. And the value `count` is updated accordingly as the page count increases.

When accessing the same `payload.data` from [ssrcontext](#ssrcontext), you can access the same value on the server-side as well.

- **state** - `type: record object` - When you use `useState` composable in Nuxt to set shared state, this state data is accessed through `payload.state.[name-of-your-state]`.

```js [plugins/my-plugin.ts]
export const useColor = () => useState<string>('color', () => 'pink')

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) {
    const color = useColor()
  }
})
```

- **config** - Same as the [$config](#config) section above.

## Runtime `nuxtApp` hooks

Hooks available in `nuxtApp` allows you to customize the runtime aspects of your Nuxt application. You can use runtime hooks in Vue composable and [Nuxt Plugins](/guide/directory-structure/plugins) to hook into the rendering lifecycle.

### hooks

`nuxtApp` lets you call and add the following runtime hooks:

```ts
// App related runtime hooks
'app:created': (app: App<Element>) => HookResult
'app:beforeMount': (app: App<Element>) => HookResult
'app:mounted': (app: App<Element>) => HookResult
'app:rendered': (ctx: AppRenderedContext) => HookResult
'app:redirected': () => HookResult
'app:suspense:resolve': (Component?: VNode) => HookResult
'app:error': (err: any) => HookResult
'app:error:cleared': (options: { redirect?: string }) => HookResult
'app:data:refresh': (keys?: string[]) => HookResult

// Nuxt page related runtime hooks
'page:start': (Component?: VNode) => HookResult
'page:finish': (Component?: VNode) => HookResult
'meta:register': (metaRenderers: Array<(nuxt: NuxtApp) => NuxtMeta | Promise<NuxtMeta>>) => HookResult

// Vue instance related runtime hooks
'vue:setup': () => void
'vue:error': (...args: Parameters<Parameters<typeof onErrorCaptured>[0]>) => HookResult
```

### hook - `type: function`

`hook` function is useful for adding custom logic by hooking into the rendering lifecycle at a specific point. `hook` function is mostly used in creating Nuxt plugins.

```js [plugins/test.ts]
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:start', () => {
    /* your code goes here */
  })
  nuxtApp.hook('vue:error', (..._args) => {
  console.log('vue:error')
    // if (process.client) {
    //   console.log(..._args)
    // }
  })
})
```

### callhook - `type: function`

`callHook` returns promise when called with any of the existing hooks.

```js
await nuxtApp.callHook('app:created', vueApp)
```
