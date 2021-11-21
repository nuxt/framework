 

# `components`
- **Type**: `boolean | SrcTypesComponentsComponentsOptions | SrcTypesComponentsComponentsOptions['dirs']`
- **Default**: `{}`

> Configure Nuxt component auto-registration.


Any components in the directories configured here can be used throughout your pages, layouts (and other components) without needing to explicitly import them.


# `autoImports`

## `global`
- **Type**: `boolean`
- **Default**: `false`


## `dirs`
- **Type**: `array`
- **Default**: `[]`


# `vue`

## `config`

### `silent`
- **Type**: `boolean`
- **Default**: `true`


### `performance`
- **Type**: `boolean`
- **Default**: `false`


## `compilerOptions`
- **Type**: `@vueCompilerCoreCompilerOptions`
- **Default**: `{}`

> Options for the Vue compiler that will be passed at build time


# `app`

# `appTemplatePath`
- **Type**: `string`
- **Default**: `"/project/.nuxt/views/app.template.html"`

> The path to a templated HTML file for rendering Nuxt responses. Uses `<srcDir>/app.html` if it exists or the Nuxt default template if not.


# `store`
- **Type**: `boolean`
- **Default**: `false`

> Enable or disable vuex store.


By default it is enabled if there is a `store/` directory


# `vueMeta`
- **Type**: `VueMetaVueMetaOptions`
- **Default**: `null`

> Options to pass directly to `vue-meta`.


# `head`

## `meta`
- **Type**: `array`
- **Default**: `[]`

> Each item in the array maps to a newly-created `<meta>` element, where object properties map to attributes.


## `link`
- **Type**: `array`
- **Default**: `[]`

> Each item in the array maps to a newly-created `<link>` element, where object properties map to attributes.


## `style`
- **Type**: `array`
- **Default**: `[]`

> Each item in the array maps to a newly-created `<style>` element, where object properties map to attributes.


## `script`
- **Type**: `array`
- **Default**: `[]`

> Each item in the array maps to a newly-created `<script>` element, where object properties map to attributes.


# `meta`

## `meta`
- **Type**: `array`
- **Default**: `[]`


## `link`
- **Type**: `array`
- **Default**: `[]`


## `style`
- **Type**: `array`
- **Default**: `[]`


## `script`
- **Type**: `array`
- **Default**: `[]`


# `fetch`

## `server`
- **Type**: `boolean`
- **Default**: `true`

> Whether to enable `fetch()` on the server.


## `client`
- **Type**: `boolean`
- **Default**: `true`

> Whether to enable `fetch()` on the client.


# `plugins`
- **Type**: `SrcTypesNuxtNuxtPlugin[]`
- **Default**: `[]`

> An array of nuxt app plugins.


Each plugin can be a string (which can be an absolute or relative path to a file). If it ends with `.client` or `.server` then it will be automatically loaded only in the appropriate context.
It can also be an object with `src` and `mode` keys.


# `extendPlugins`
- **Type**: `(plugins: Array<{ src: string, mode?: 'client' | 'server' }>) => Array<{ src: string, mode?: 'client' | 'server' }>`
- **Default**: `null`

> You may want to extend plugins or change their order. For this, you can pass a function using `extendPlugins`. It accepts an array of plugin objects and should return an array of plugin objects.


# `css`
- **Type**: `string[]`
- **Default**: `[]`

> You can define the CSS files/modules/libraries you want to set globally (included in every page).


Nuxt will automatically guess the file type by its extension and use the appropriate pre-processor. You will still need to install the required loader if you need to use them.


# `layouts`
- **Type**: `Record<string, string>`
- **Default**: `{}`

> An object where each key name maps to a path to a layout .vue file.


Normally there is no need to configure this directly.


# `ErrorPage`
- **Type**: `string`
- **Default**: `null`

> Set a custom error page layout.


Normally there is no need to configure this directly.


# `loading`

## `color`
- **Type**: `string`
- **Default**: `"black"`

> CSS color of the progress bar


## `failedColor`
- **Type**: `string`
- **Default**: `"red"`

> CSS color of the progress bar when an error appended while rendering the route (if data or fetch sent back an error for example).


## `height`
- **Type**: `string`
- **Default**: `"2px"`

> Height of the progress bar (used in the style property of the progress bar).


## `throttle`
- **Type**: `number`
- **Default**: `200`

> In ms, wait for the specified time before displaying the progress bar. Useful for preventing the bar from flashing.


## `duration`
- **Type**: `number`
- **Default**: `5000`

> In ms, the maximum duration of the progress bar, Nuxt assumes that the route will be rendered before 5 seconds.


## `continuous`
- **Type**: `boolean`
- **Default**: `false`

> Keep animating progress bar when loading takes longer than duration.


## `rtl`
- **Type**: `boolean`
- **Default**: `false`

> Set the direction of the progress bar from right to left.


## `css`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to remove default progress bar styles (and add your own).


# `loadingIndicator`

# `pageTransition`

# `layoutTransition`

# `features`

## `store`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable Nuxt vuex integration


## `layouts`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable layouts


## `meta`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable Nuxt integration with `vue-meta` and the `head` property


## `middleware`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable middleware


## `transitions`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable transitions


## `deprecations`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable support for deprecated features and aliases


## `validate`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable the Nuxt `validate()` hook


## `useAsyncData`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable the Nuxt `asyncData()` hook


## `fetch`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable the Nuxt `fetch()` hook


## `clientOnline`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable `$nuxt.isOnline`


## `clientPrefetch`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable prefetching behavior in `<NuxtLink>`


## `componentAliases`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable extra component aliases like `<NLink>` and `<NChild>`


## `componentClientOnly`
- **Type**: `boolean`
- **Default**: `true`

> Set to false to disable the `<ClientOnly>` component (see [docs](https://github.com/egoist/vue-client-only))


# `rootDir`
- **Type**: `string`
- **Default**: `"/project"`

> Define the workspace directory of your application.


This property can be overwritten (for example, running `nuxt ./my-app/` will set the `rootDir` to the absolute path of `./my-app/` from the current/working directory.
It is normally not needed to configure this option.


# `srcDir`
- **Type**: `string`
- **Default**: `"/project"`

> Define the source directory of your Nuxt application.


If a relative path is specified it will be relative to the `rootDir`.


# `buildDir`
- **Type**: `string`
- **Default**: `"/project/.nuxt"`

> Define the directory where your built Nuxt files will be placed.


Many tools assume that `.nuxt` is a hidden directory (because it starts with a `.`). If that is a problem, you can use this option to prevent that.


# `dev`
- **Type**: `boolean`
- **Default**: `false`

> Whether Nuxt is running in development mode.


Normally you should not need to set this.


# `test`
- **Type**: `boolean`
- **Default**: `false`

> Whether your app is being unit tested


# `debug`
- **Type**: `boolean`
- **Default**: `false`

> Set to true to enable debug mode.


By default it's only enabled in development mode.


# `env`

# `createRequire`
- **Type**: `'jiti' | 'native' | ((p: string | { filename: string }) => NodeRequire)`
- **Default**: `undefined`

> Set the method Nuxt uses to require modules, such as loading `nuxt.config`, server middleware, and so on - defaulting to `jiti` (which has support for TypeScript and ESM syntax).

```ts
() => any
```


# `target`
- **Type**: `'server' | 'static'`
- **Default**: `"server"`

> Whether your Nuxt app should be built to be served by the Nuxt server (`server`) or as static HTML files suitable for a CDN or other static file server (`static`).


This is unrelated to `ssr`.


# `ssr`
- **Type**: `boolean`
- **Default**: `true`

> Whether to enable rendering of HTML - either dynamically (in server mode) or at generate time. If set to `false` and combined with `static` target, generated pages will simply display a loading screen with no content.


# `mode`
- **Type**: `string`
- **Default**: `"spa"`


# `modern`
- **Type**: `'server' | 'client' | boolean`
- **Default**: `{}`

> Whether to produce a separate modern build targeting browsers that support ES modules.


Set to `'server'` to enable server mode, where the Nuxt server checks browser version based on the user agent and serves the correct bundle.
Set to `'client'` to serve both the modern bundle with `<script type="module">` and the legacy bundle with `<script nomodule>`. It will also provide a `<link rel="modulepreload">` for the modern bundle. Every browser that understands the module type will load the modern bundle while older browsers fall back to the legacy (transpiled) bundle.
If you have set `modern: true` and are generating your app or have `ssr: false`, modern will be set to `'client'`.
If you have set `modern: true` and are serving your app, modern will be set to `'server'`.


# `modules`
- **Type**: `SrcTypesModuleModuleInstallOptions[]`
- **Default**: `[]`

> Modules are Nuxt extensions which can extend its core functionality and add endless integrations


Each module is either a string (which can refer to a package, or be a path to a file), a tuple with the module as first string and the options as a second object, or an inline module function.
Nuxt tries to resolve each item in the modules array using node require path (in `node_modules`) and then will be resolved from project `srcDir` if `~` alias is used.


# `buildModules`
- **Type**: `SrcTypesModuleModuleInstallOptions[]`
- **Default**: `[]`

> Modules that are only required during development and build time.


Modules are Nuxt extensions which can extend its core functionality and add endless integrations
Each module is either a string (which can refer to a package, or be a path to a file), a tuple with the module as first string and the options as a second object, or an inline module function.
Nuxt tries to resolve each item in the modules array using node require path (in `node_modules`) and then will be resolved from project `srcDir` if `~` alias is used.


# `_modules`
- **Type**: `array`
- **Default**: `[]`

> Built-in ad-hoc modules


 @private


# `globalName`
- **Type**: `string`
- **Default**: `"nuxt"`

> Allows customizing the global ID used in the main HTML template as well as the main Vue instance name and other options.


# `globals`

## `id`
- **Type**: `(globalName: string) => string`
- **Default**: `undefined`

```ts
() => any
```


## `nuxt`
- **Type**: `(globalName: string) => string`
- **Default**: `undefined`

```ts
() => any
```


## `context`
- **Type**: `(globalName: string) => string`
- **Default**: `undefined`

```ts
() => any
```


## `pluginPrefix`
- **Type**: `(globalName: string) => string`
- **Default**: `undefined`

```ts
() => any
```


## `readyCallback`
- **Type**: `(globalName: string) => string`
- **Default**: `undefined`

```ts
() => any
```


## `loadedCallback`
- **Type**: `(globalName: string) => string`
- **Default**: `undefined`

```ts
() => any
```


# `serverMiddleware`
- **Type**: `array`
- **Default**: `[]`

> Server middleware are connect/express/h3-shaped functions that handle server-side requests. They run on the server and before the Vue renderer.


By adding entries to `serverMiddleware` you can register additional routes or modify `req`/`res` objects without the need for an external server.
You can pass a string, which can be the name of a node dependency or a path to a file. You can also pass an object with `path` and `handler` keys. (`handler` can be a path or a function.)


# `modulesDir`
- **Type**: `array`
- **Default**: `["/project/node_modules","/home/pooya/Code/framework/packages/schema/node_modules"]`

> Used to set the modules directories for path resolving (for example, webpack's `resolveLoading`, `nodeExternals` and `postcss`).


The configuration path is relative to `options.rootDir` (default is current working directory).
Setting this field may be necessary if your project is organized as a yarn workspace-styled mono-repository.


# `dir`

## `assets`
- **Type**: `string`
- **Default**: `"assets"`

> The assets directory (aliased as `~assets` in your build)


## `app`
- **Type**: `string`
- **Default**: `"app"`

> The directory containing app template files like `app.html` and `router.scrollBehavior.js`


## `layouts`
- **Type**: `string`
- **Default**: `"layouts"`

> The layouts directory, each file of which will be auto-registered as a Nuxt layout.


## `middleware`
- **Type**: `string`
- **Default**: `"middleware"`

> The middleware directory, each file of which will be auto-registered as a Nuxt middleware.


## `pages`
- **Type**: `string`
- **Default**: `"pages"`

> The directory which will be processed to auto-generate your application page routes.


## `public`
- **Type**: `string`
- **Default**: `"public"`

> The directory containing your static files, which will be directly accessible via the Nuxt server and copied across into your `dist` folder when your app is generated.


## `static`
- **Type**: `string`
- **Default**: `"public"`


## `store`
- **Type**: `string`
- **Default**: `"store"`

> The folder which will be used to auto-generate your Vuex store structure.


# `extensions`
- **Type**: `array`
- **Default**: `[".js",".jsx",".mjs",".ts",".tsx",".vue"]`

> The extensions that should be resolved by the Nuxt resolver.


# `styleExtensions`
- **Type**: `array`
- **Default**: `[".css",".pcss",".postcss",".styl",".stylus",".scss",".sass",".less"]`

> The style extensions that should be resolved by the Nuxt resolver (for example, in `css` property).


# `alias`

# `ignoreOptions`
- **Type**: `any`
- **Default**: `{}`

> Pass options directly to `node-ignore` (which is used by Nuxt to ignore files).


# `ignorePrefix`
- **Type**: `string`
- **Default**: `"-"`

> Any file in `pages/`, `layouts/`, `middleware/` or `store/` will be ignored during building if its filename starts with the prefix specified by `ignorePrefix`.


# `ignore`
- **Type**: `array`
- **Default**: `["**/*.test.*","**/*.spec.*","**/-*.*"]`

> More customizable than `ignorePrefix`: all files matching glob patterns specified inside the `ignore` array will be ignored in building.


# `watch`
- **Type**: `string[]`
- **Default**: `[]`

> The watch property lets you watch custom files for restarting the server.


`chokidar` is used to set up the watchers. To learn more about its pattern options, see chokidar documentation.


# `watchers`

## `rewatchOnRawEvents`
- **Type**: `any`
- **Default**: `{}`

> An array of event types, which, when received, will cause the watcher to restart.


## `webpack`

### `aggregateTimeout`
- **Type**: `number`
- **Default**: `1000`


## `chokidar`

### `ignoreInitial`
- **Type**: `boolean`
- **Default**: `true`


# `editor`
- **Type**: `string`
- **Default**: `undefined`

> Your preferred code editor to launch when debugging.


# `hooks`
- **Type**: `SrcTypesHooksNuxtHooks`
- **Default**: `null`

> Hooks are listeners to Nuxt events that are typically used in modules, but are also available in `nuxt.config`.


Internally, hooks follow a naming pattern using colons (e.g., build:done).
For ease of configuration, you can also structure them as an hierarchical object in `nuxt.config` (as below).


# `privateRuntimeConfig`
- **Type**: `SrcTypesConfigPrivateRuntimeConfig`
- **Default**: `{}`

> Runtime config allows passing dynamic config and environment variables to the Nuxt app context.


It is added to the Nuxt payload so there is no need to rebuild to update your configuration in development or if your application is served by the Nuxt server. (For static sites you will still need to regenerate your site to see changes.)
The value of this object is accessible from server only using `$config`.
It will override `publicRuntimeConfig` on the server-side.
It should hold _private_ environment variables (that should not be exposed on the frontend). This could include a reference to your API secret tokens.


# `publicRuntimeConfig`

# `_majorVersion`
- **Type**: `number`
- **Default**: `2`


# `_legacyGenerate`
- **Type**: `boolean`
- **Default**: `false`


# `_start`
- **Type**: `boolean`
- **Default**: `false`


# `_build`
- **Type**: `boolean`
- **Default**: `false`


# `_generate`
- **Type**: `boolean`
- **Default**: `false`


# `_cli`
- **Type**: `boolean`
- **Default**: `false`


# `_requiredModules`
- **Type**: `any`
- **Default**: `{}`


# `_nuxtConfigFile`
- **Type**: `any`
- **Default**: `{}`


# `_nuxtConfigFiles`
- **Type**: `array`
- **Default**: `[]`


# `appDir`
- **Type**: `string`
- **Default**: `""`


# `build`

## `quiet`
- **Type**: `boolean`
- **Default**: `false`

> Suppresses most of the build output log.


It is enabled by default when a CI or test environment is detected.


## `analyze`
- **Type**: `boolean | WebpackBundleAnalyzerBundleAnalyzerPluginOptions | RollupPluginVisualizerPluginVisualizerOptions`
- **Default**: `false`

> Nuxt uses `webpack-bundle-analyzer` to visualize your bundles and how to optimize them.


Set to `true` to enable bundle analysis, or pass an object with options: [for webpack](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin) or [for vite](https://github.com/btd/rollup-plugin-visualizer#options).


## `profile`
- **Type**: `boolean`
- **Default**: `false`

> Enable the profiler in webpackbar.


It is normally enabled by CLI argument `--profile`.


## `extractCSS`
- **Type**: `boolean`
- **Default**: `false`

> Enables Common CSS Extraction using [Vue Server Renderer guidelines](https://ssr.vuejs.org/guide/css.html).


Using [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin/) under the hood, your CSS will be extracted into separate files, usually one per component. This allows caching your CSS and JavaScript separately and is worth trying if you have a lot of global or shared CSS.


## `cssSourceMap`
- **Type**: `boolean`
- **Default**: `false`

> Enables CSS source map support (defaults to true in development)


## `ssr`
- **Type**: `any`
- **Default**: `{}`

> Creates special webpack bundle for SSR renderer. It is normally not necessary to change this value.


## `parallel`
- **Type**: `boolean`
- **Default**: `false`

> Enable [thread-loader](https://github.com/webpack-contrib/thread-loader#thread-loader) when building app with webpack.


## `cache`
- **Type**: `boolean`
- **Default**: `false`

> Enable caching for [`terser-webpack-plugin`](https://github.com/webpack-contrib/terser-webpack-plugin#options) and [`cache-loader`](https://github.com/webpack-contrib/cache-loader#cache-loader)


## `standalone`
- **Type**: `boolean`
- **Default**: `false`

> Inline server bundle dependencies


This mode bundles `node_modules` that are normally preserved as externals in the server build.


## `publicPath`
- **Type**: `string`
- **Default**: `"/_nuxt/"`

> If you are uploading your dist files to a CDN, you can set the publicPath to your CDN.


## `serverURLPolyfill`
- **Type**: `string`
- **Default**: `"url"`

> The polyfill library to load to provide URL and URLSearchParams.


Defaults to `'url'` ([see package](https://www.npmjs.com/package/url)).


## `filenames`

### `app`
- **Type**: `function`
- **Default**: `undefined`

```ts
() => any
```


### `chunk`
- **Type**: `function`
- **Default**: `undefined`

```ts
() => any
```


### `css`
- **Type**: `function`
- **Default**: `undefined`

```ts
() => any
```


### `img`
- **Type**: `function`
- **Default**: `undefined`

```ts
() => any
```


### `font`
- **Type**: `function`
- **Default**: `undefined`

```ts
() => any
```


### `video`
- **Type**: `function`
- **Default**: `undefined`

```ts
() => any
```


## `loaders`

### `file`

#### `esModule`
- **Type**: `boolean`
- **Default**: `false`


### `fontUrl`

#### `esModule`
- **Type**: `boolean`
- **Default**: `false`


#### `limit`
- **Type**: `number`
- **Default**: `1000`


### `imgUrl`

#### `esModule`
- **Type**: `boolean`
- **Default**: `false`


#### `limit`
- **Type**: `number`
- **Default**: `1000`


### `pugPlain`
- **Type**: `any`
- **Default**: `{}`


### `vue`

#### `productionMode`
- **Type**: `boolean`
- **Default**: `true`


#### `transformAssetUrls`

##### `video`
- **Type**: `string`
- **Default**: `"src"`


##### `source`
- **Type**: `string`
- **Default**: `"src"`


##### `object`
- **Type**: `string`
- **Default**: `"src"`


##### `embed`
- **Type**: `string`
- **Default**: `"src"`


#### `compilerOptions`

### `css`

#### `importLoaders`
- **Type**: `number`
- **Default**: `0`


#### `esModule`
- **Type**: `boolean`
- **Default**: `false`


### `cssModules`

#### `importLoaders`
- **Type**: `number`
- **Default**: `0`


#### `esModule`
- **Type**: `boolean`
- **Default**: `false`


#### `modules`

##### `localIdentName`
- **Type**: `string`
- **Default**: `"[local]_[hash:base64:5]"`


### `less`
- **Type**: `any`
- **Default**: `{"sourceMap":false}`


### `sass`

#### `sassOptions`

##### `indentedSyntax`
- **Type**: `boolean`
- **Default**: `true`


### `scss`
- **Type**: `any`
- **Default**: `{"sourceMap":false}`


### `stylus`
- **Type**: `any`
- **Default**: `{"sourceMap":false}`


### `vueStyle`
- **Type**: `any`
- **Default**: `{"sourceMap":false}`


## `styleResources`
- **Type**: `any`
- **Default**: `{}`


## `plugins`
- **Type**: `array`
- **Default**: `[]`

> Add webpack plugins.


## `terser`
- **Type**: `any`
- **Default**: `{}`

> Terser plugin options.


Set to false to disable this plugin, or pass an object of options.


## `hardSource`
- **Type**: `boolean`
- **Default**: `false`

> Enables the [HardSourceWebpackPlugin](https://github.com/mzgoddard/hard-source-webpack-plugin) for improved caching.


## `aggressiveCodeRemoval`
- **Type**: `boolean`
- **Default**: `false`

> Hard-replaces `typeof process`, `typeof window` and `typeof document` to tree-shake bundle.


## `optimizeCSS`
- **Type**: `boolean`
- **Default**: `false`

> OptimizeCSSAssets plugin options.


Defaults to true when `extractCSS` is enabled.


## `optimization`

### `runtimeChunk`
- **Type**: `string`
- **Default**: `"single"`


### `minimize`
- **Type**: `boolean`
- **Default**: `true`

> Set minimize to false to disable all minimizers. (It is disabled in development by default)


### `minimizer`
- **Type**: `any`
- **Default**: `{}`

> You can set minimizer to a customized array of plugins.


### `splitChunks`

#### `chunks`
- **Type**: `string`
- **Default**: `"all"`


#### `automaticNameDelimiter`
- **Type**: `string`
- **Default**: `"/"`


#### `cacheGroups`
- **Type**: `any`
- **Default**: `{}`


## `splitChunks`

### `layouts`
- **Type**: `boolean`
- **Default**: `false`


### `pages`
- **Type**: `boolean`
- **Default**: `true`


### `commons`
- **Type**: `boolean`
- **Default**: `true`


## `corejs`
- **Type**: `string`
- **Default**: `"auto"`

> Nuxt will automatically detect the current version of `core-js` in your project (`'auto'`), or you can specify which version you want to use (`2` or `3`).


## `babel`

### `configFile`
- **Type**: `boolean`
- **Default**: `false`


### `babelrc`
- **Type**: `boolean`
- **Default**: `false`


### `plugins`
- **Type**: `array`
- **Default**: `[]`

> An array of Babel plugins to load, or a function that takes webpack context and returns an array of Babel plugins.


For more information see [Babel plugins options](https://babeljs.io/docs/en/options#plugins) and [babel-loader options](https://github.com/babel/babel-loader#options).


### `presets`
- **Type**: `any`
- **Default**: `{}`

> The Babel presets to be applied.


### `cacheDirectory`
- **Type**: `boolean`
- **Default**: `false`


## `transpile`
- **Type**: `Array<string | RegExp | Function>`
- **Default**: `[]`

> If you want to transpile specific dependencies with Babel, you can add them here. Each item in transpile can be a package name, a function, a string or regex object matching the dependency's file name.


Tou can also use a function to conditionally transpile, the function will receive a object ({ isDev, isServer, isClient, isModern, isLegacy }).


## `postcss`

### `execute`
- **Type**: `undefined`
- **Default**: `undefined`


### `postcssOptions`

#### `config`
- **Type**: `undefined`
- **Default**: `undefined`


#### `plugins`
- **Type**: `undefined`
- **Default**: `undefined`


### `sourceMap`
- **Type**: `undefined`
- **Default**: `undefined`


### `implementation`
- **Type**: `undefined`
- **Default**: `undefined`


### `order`
- **Type**: `string`
- **Default**: `""`


## `html`

### `minify`

#### `collapseBooleanAttributes`
- **Type**: `boolean`
- **Default**: `true`


#### `decodeEntities`
- **Type**: `boolean`
- **Default**: `true`


#### `minifyCSS`
- **Type**: `boolean`
- **Default**: `true`


#### `minifyJS`
- **Type**: `boolean`
- **Default**: `true`


#### `processConditionalComments`
- **Type**: `boolean`
- **Default**: `true`


#### `removeEmptyAttributes`
- **Type**: `boolean`
- **Default**: `true`


#### `removeRedundantAttributes`
- **Type**: `boolean`
- **Default**: `true`


#### `trimCustomFragments`
- **Type**: `boolean`
- **Default**: `true`


#### `useShortDoctype`
- **Type**: `boolean`
- **Default**: `true`


## `template`
- **Type**: `any`
- **Default**: `{}`

> Allows setting a different app template (other than `@nuxt/vue-app`)


## `templates`
- **Type**: `array`
- **Default**: `[]`

> You can provide your own templates which will be rendered based on Nuxt configuration. This feature is specially useful for using with modules.


Templates are rendered using [`lodash.template`](https://lodash.com/docs/4.17.15#template).


## `watch`
- **Type**: `array`
- **Default**: `[]`

> You can provide your custom files to watch and regenerate after changes.


This feature is specially useful for using with modules.


## `devMiddleware`

### `stats`
- **Type**: `string`
- **Default**: `"none"`


## `hotMiddleware`
- **Type**: `any`
- **Default**: `{}`

> See [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) for available options.


## `vendor`

### `$meta`

#### `deprecated`
- **Type**: `string`
- **Default**: `"vendor has been deprecated since nuxt 2"`


## `stats`

### `excludeAssets`
- **Type**: `array`
- **Default**: `[{},{},{}]`


## `friendlyErrors`
- **Type**: `boolean`
- **Default**: `true`

> Set to `false` to disable the overlay provided by [FriendlyErrorsWebpackPlugin](https://github.com/nuxt/friendly-errors-webpack-plugin)


## `additionalExtensions`
- **Type**: `array`
- **Default**: `[]`

> Additional extensions (beyond `['vue', 'js']` to support in `pages/`, `layouts/`, `middleware/`, etc.)


## `warningIgnoreFilters`
- **Type**: `array`
- **Default**: `[]`

> Filters to hide build warnings.


## `followSymlinks`
- **Type**: `boolean`
- **Default**: `false`

> Set to true to scan files within symlinks in the build (such as within `pages/`).


# `messages`

## `loading`
- **Type**: `string`
- **Default**: `"Loading..."`

> The text that displays on the Nuxt loading indicator when `ssr: false`.


## `error_404`
- **Type**: `string`
- **Default**: `"This page could not be found"`

> The 404 text on the default Nuxt error page.


## `server_error`
- **Type**: `string`
- **Default**: `"Server error"`

> The text to display on the default Nuxt error page when there has been a server error.


## `nuxtjs`
- **Type**: `string`
- **Default**: `"Nuxt"`

> The text (linked to nuxtjs.org) that appears on the built-in Nuxt error page.


## `back_to_home`
- **Type**: `string`
- **Default**: `"Back to the home page"`

> The text (linked to the home page) that appears on the built-in Nuxt error page.


## `server_error_details`
- **Type**: `string`
- **Default**: `"An error occurred in the application and your page could not be served. If you are the application owner, check your logs for details."`

> The message that will display on a white screen if the built-in Nuxt error page can't be rendered.


## `client_error`
- **Type**: `string`
- **Default**: `"Error"`

> The default error title (if there isn't a specific error message) on the built-in Nuxt error page.


## `client_error_details`
- **Type**: `string`
- **Default**: `"An error occurred while rendering the page. Check developer tools console for details."`

> The error message (in debug mode) on the built-in Nuxt error page.


# `render`

## `bundleRenderer`

### `shouldPrefetch`
- **Type**: `function`
- **Default**: `undefined`

```ts
() => any
```


### `shouldPreload`
- **Type**: `function`
- **Default**: `undefined`

```ts
() => any
```


### `runInNewContext`
- **Type**: `boolean`
- **Default**: `false`

> enabled by default for development


## `crossorigin`
- **Type**: `any`
- **Default**: `{}`

> Configure the crossorigin attribute on `<link rel="stylesheet">` and `<script>` tags in generated HTML. [More information](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin).


## `resourceHints`
- **Type**: `boolean`
- **Default**: `true`

> Adds prefetch and preload links for faster initial page load time. You probably don't want to disable this option unless you have many pages and routes.


## `ssr`
- **Type**: `any`
- **Default**: `{}`

> Whether to enable rendering of HTML - either dynamically (in server mode) or at generate time.


This option is automatically set based on global ssr value if not provided. This can be useful to dynamically enable/disable SSR on runtime after image builds (with docker for example).


## `ssrLog`
- **Type**: `boolean`
- **Default**: `false`

> Forward server-side logs to the browser for better debugging (only available in development)


Set to `collapsed` to collapse the logs, or false to disable.


## `http2`

### `push`
- **Type**: `boolean`
- **Default**: `false`

> Set to true to enable HTTP2 push headers


### `shouldPush`
- **Type**: `any`
- **Default**: `null`


### `pushAssets`
- **Type**: `any`
- **Default**: `null`

> You can control what links to push using this function. It receives `req`, `res`, `publicPath` and a `preloadFiles` array.


You can add your own assets to the array as well. Using `req` and `res` you can decide what links to push based on the request headers, for example using the cookie with application version.
Assets will be joined together with `,` and passed as a single `Link` header.


## `static`

### `prefix`
- **Type**: `boolean`
- **Default**: `true`

> Whether to add the router base to your static assets.


## `compressor`

### `threshold`
- **Type**: `number`
- **Default**: `0`


## `etag`

### `hash`
- **Type**: `boolean`
- **Default**: `false`


### `weak`
- **Type**: `boolean`
- **Default**: `false`


## `csp`
- **Type**: `boolean`
- **Default**: `false`

> Use this to configure Content-Security-Policy to load external resources. [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).


Set to `true` to enable, or you can pass options to fine-tune your CSP options.
**Prerequisites**: These CSP settings are only effective when using Nuxt with `mode: 'server'` to serve your SSR application.
**Updating settings**: These settings are read by the Nuxt server directly from `nuxt.config.js`. This means changes to these settings take effect when the server is restarted. There is no need to rebuild the application to update CSP settings.


## `dist`

### `index`
- **Type**: `boolean`
- **Default**: `false`


### `maxAge`
- **Type**: `string`
- **Default**: `"1y"`


## `fallback`

### `dist`
- **Type**: `any`
- **Default**: `{}`

> For routes matching the publicPath (`/_nuxt/*`) Disable by setting to false.


### `static`

#### `skipUnknown`
- **Type**: `boolean`
- **Default**: `true`


#### `handlers`

##### `.htm`
- **Type**: `boolean`
- **Default**: `false`


##### `.html`
- **Type**: `boolean`
- **Default**: `false`


# `router`

## `mode`
- **Type**: `string`
- **Default**: `"history"`

> Configure the router mode.


For server-side rendering it is not recommended to change it./


## `base`
- **Type**: `string`
- **Default**: `"/"`

> The base URL of the app. For example, if the entire single page application is served under /app/, then base should use the value '/app/'.


This can be useful if you need to serve Nuxt as a different context root, from within a bigger web site.


## `_routerBaseSpecified`
- **Type**: `boolean`
- **Default**: `true`


## `routes`
- **Type**: `array`
- **Default**: `[]`


## `routeNameSplitter`
- **Type**: `string`
- **Default**: `"-"`

> This allows changing the separator between route names that Nuxt uses.


Imagine we have the page file `pages/posts/_id.vue`. Nuxt will generate the route name programmatically, in this case `posts-id`. If you change the routeNameSplitter config to `/` the name will change to `posts/id`.


## `middleware`
- **Type**: `array`
- **Default**: `[]`

> Set the default(s) middleware for every page of the application.


## `linkActiveClass`
- **Type**: `string`
- **Default**: `"nuxt-link-active"`

> Globally configure `<nuxt-link>` default active class.


## `linkExactActiveClass`
- **Type**: `string`
- **Default**: `"nuxt-link-exact-active"`

> Globally configure `<nuxt-link>` default exact active class.


## `linkPrefetchedClass`
- **Type**: `boolean`
- **Default**: `false`

> Globally configure `<nuxt-link>` default prefetch class (feature disabled by default)


## `extendRoutes`
- **Type**: `any`
- **Default**: `null`

> You can pass a function to extend the routes created by Nuxt.


## `scrollBehavior`
- **Type**: `any`
- **Default**: `{}`

> The `scrollBehavior` option lets you define a custom behavior for the scroll position between the routes. This method is called every time a page is rendered. To learn more about it.


## `parseQuery`
- **Type**: `boolean`
- **Default**: `false`

> Provide custom query string parse function. Overrides the default.


## `stringifyQuery`
- **Type**: `boolean`
- **Default**: `false`

> Provide custom query string stringify function. Overrides the default.


## `fallback`
- **Type**: `boolean`
- **Default**: `false`

> Controls whether the router should fall back to hash mode when the browser does not support history.pushState but mode is set to history.


Setting this to false essentially makes every router-link navigation a full page refresh in IE9. This is useful when the app is server-rendered and needs to work in IE9, because a hash mode URL does not work with SSR.


## `prefetchLinks`
- **Type**: `boolean`
- **Default**: `true`

> Configure `<nuxt-link>` to prefetch the code-splitted page when detected within the viewport. Requires [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to be supported (see [Caniuse](https://caniuse.com/intersectionobserver)).


## `prefetchPayloads`
- **Type**: `boolean`
- **Default**: `true`

> When using nuxt generate with target: 'static', Nuxt will generate a payload.js for each page.


With this option enabled, Nuxt will automatically prefetch the payload of the linked page when the `<nuxt-link>` is visible in the viewport, making instant navigation.


## `trailingSlash`
- **Type**: `any`
- **Default**: `{}`

> If this option is set to true, trailing slashes will be appended to every route. If set to false, they'll be removed.


# `server`

## `https`
- **Type**: `boolean`
- **Default**: `false`

> Whether to enable HTTPS.


## `port`
- **Type**: `number`
- **Default**: `3000`


## `host`
- **Type**: `string`
- **Default**: `"localhost"`


## `socket`
- **Type**: `any`
- **Default**: `{}`


## `timing`
- **Type**: `function`
- **Default**: `undefined`

> Enabling timing adds a middleware to measure the time elapsed during server-side rendering and adds it to the headers as 'Server-Timing'.

```ts
() => any
```


Apart from true/false, this can be an object for providing options. Currently, only `total` is supported (which directly tracks the whole time spent on server-side rendering.


# `cli`

## `badgeMessages`
- **Type**: `string[]`
- **Default**: `[]`

> Add a message to the CLI banner by adding a string to this array.


## `bannerColor`
- **Type**: `string`
- **Default**: `"green"`

> Change the color of the 'Nuxt.js' title in the CLI banner.


# `generate`

## `dir`
- **Type**: `string`
- **Default**: `"/project/dist"`

> Directory name that holds all the assets and generated pages for a `static` build.


## `routes`
- **Type**: `array`
- **Default**: `[]`

> The routes to generate.


If you are using the crawler, this will be only the starting point for route generation. This is often necessary when using dynamic routes.
It can be an array or a function.


## `exclude`
- **Type**: `array`
- **Default**: `[]`

> An array of string or regular expressions that will prevent generation of routes matching them. The routes will still be accessible when `fallback` is set.


## `concurrency`
- **Type**: `number`
- **Default**: `500`

> The number of routes that are generated concurrently in the same thread.


## `interval`
- **Type**: `number`
- **Default**: `0`

> Interval in milliseconds between two render cycles to avoid flooding a potential API with calls.


## `subFolders`
- **Type**: `boolean`
- **Default**: `true`

> Set to `false` to disable creating a directory + `index.html` for each route.


## `fallback`
- **Type**: `string`
- **Default**: `"200.html"`

> The path to the fallback HTML file.


Set this as the error page in your static server configuration, so that unknown routes can be rendered (on the client-side) by Nuxt.
* If unset or set to a falsy value, the name of the fallback HTML file will be `200.html`. * If set to true, the filename will be `404.html`. * If you provide a string as a value, it will be used instead.


## `crawler`
- **Type**: `boolean`
- **Default**: `true`

> Set to `false` to disable generating pages discovered through crawling relative links in generated pages.


## `manifest`
- **Type**: `boolean`
- **Default**: `true`

> Set to `false` to disable generating a `manifest.js` with a list of all generated pages.


## `nojekyll`
- **Type**: `boolean`
- **Default**: `true`

> Set to `false` to disable generating a `.nojekyll` file (which aids compatibility with GitHub Pages).


## `cache`

### `ignore`
- **Type**: `array`
- **Default**: `[]`

> An array of files or directories to ignore. (It can also be a function that returns an array.)


### `globbyOptions`

#### `gitignore`
- **Type**: `boolean`
- **Default**: `true`


## `staticAssets`

### `dir`
- **Type**: `string`
- **Default**: `"static"`

> The directory underneath `/_nuxt/`, where static assets (payload, state and manifest files) will live.


### `base`
- **Type**: `string`
- **Default**: `"/project/dist"`

> The full path to the directory underneath `/_nuxt/` where static assets (payload, state and manifest files) will live.


### `versionBase`
- **Type**: `string`
- **Default**: `""`

> The full path to the versioned directory where static assets for the current buidl are located.


### `version`
- **Type**: `string`
- **Default**: `"1637506587"`

> A unique string to uniquely identify payload versions (defaults to the current timestamp).


# `typescript`

## `strict`
- **Type**: `boolean`
- **Default**: `false`

> TypeScript comes with certain checks to give you more safety and analysis of your program. Once you’ve converted your codebase to TypeScript, you can start enabling these checks for greater safety. [Read More](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html#getting-stricter-checks)


## `tsConfig`
- **Type**: `any`
- **Default**: `{}`

> You can extend generated `.nuxt/tsconfig.json` using this option


# `vite`
- **Type**: `boolean | ViteInlineConfig`
- **Default**: `{}`

> Configuration that will be passed directly to Vite.


See https://vitejs.dev/config for more information. Please note that not all vite options are supported in Nuxt.
