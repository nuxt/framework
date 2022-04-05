---
title: Nuxt Config
head.title: Nuxt configuration reference
---

# Nuxt configuration reference

## alias

- **Type**: `object`
- **Default**
```json
{
  "~~": "/<rootDir>",
  "@@": "/<rootDir>",
  "~": "/<rootDir>",
  "@": "/<rootDir>",
  "assets": "/<rootDir>/assets",
  "public": "/<rootDir>/public"
}
```

> You can improve your DX by defining additional aliases to access custom directories within your JavaScript and CSS.

::alert{type="info"}
**Note**: Within a webpack context (image sources, CSS - but not JavaScript) you _must_ access
your alias by prefixing it with `~`.
::

::alert{type="info"}
**Note**: These aliases will be automatically added to the generated `.nuxt/tsconfig.json` so you can get full
type support and path auto-complete. In case you need to extend options provided by `./.nuxt/tsconfig.json`
further, make sure to add them here or within the `typescript.tsConfig` property in `nuxt.config`.
::

**Example**:
```js
import { resolve } from 'pathe'
export default {
  alias: {
    'images': resolve(__dirname, './assets/images'),
    'style': resolve(__dirname, './assets/style'),
    'data': resolve(__dirname, './assets/other/data')
  }
}
```
<!-- ```html
<template>
  <img src="~images/main-bg.jpg">
</template>

<script>
import data from 'data/test.json'
</script>

<style>
// Uncomment the below
//@import '~style/variables.scss';
//@import '~style/utils.scss';
//@import '~style/base.scss';
body {
  background-image: url('~images/main-bg.jpg');
}
</style>
``` -->
## app

> Nuxt App configuration.


### `baseURL`

- **Type**: `string`
- **Default:** `"/"`

> The base path of your Nuxt application.

This can be set at runtime by setting the BASE_PATH environment variable.

**Example**:
```bash
BASE_PATH=/prefix/ node .output/server/index.mjs
```

### `buildAssetsDir`

- **Type**: `string`
- **Default:** `"/_nuxt/"`

> The folder name for the built site assets, relative to `baseURL` (or `cdnURL` if set). This is set at build time and should not be customized at runtime.


### `cdnURL`

- **Default:** `null`

> An absolute URL to serve the public folder from (production-only).

This can be set to a different value at runtime by setting the CDN_URL environment variable.

**Example**:
```bash
CDN_URL=https://mycdn.org/ node .output/server/index.mjs
```
## autoImports

> Configure how Nuxt auto-imports composables into your application.

**See**: [Nuxt 3 documentation](https://v3.nuxtjs.org/docs/directory-structure/composables)

### `dirs`

- **Type**: `array`


### `global`

- **Type**: `boolean`
- **Default:** `false`

## build

> Shared build configuration.


### `analyze`

- **Type**: `boolean`
- **Default:** `false`

> Nuxt uses `webpack-bundle-analyzer` to visualize your bundles and how to optimize them.

Set to `true` to enable bundle analysis, or pass an object with options: [for webpack](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin) or [for vite](https://github.com/btd/rollup-plugin-visualizer#options).

**Example**:
```js
analyze: {
  analyzerMode: 'static'
}
```

### `quiet`

- **Type**: `boolean`
- **Default:** `false`

> Suppresses most of the build output log.

It is enabled by default when a CI or test environment is detected.

**See**: [std-env](https://github.com/unjs/std-env)

### `templates`

- **Type**: `array`

> You can provide your own templates which will be rendered based on Nuxt configuration. This feature is specially useful for using with modules.

Templates are rendered using [`lodash.template`](https://lodash.com/docs/4.17.15#template).

**Example**:
```js
templates: [
  {
    src: '~/modules/support/plugin.js', // `src` can be absolute or relative
    dst: 'support.js', // `dst` is relative to project `.nuxt` dir
    options: {
      // Options are provided to template as `options` key
      live_chat: false
    }
  }
]
```

### `transpile`

- **Type**: `array`

> If you want to transpile specific dependencies with Babel, you can add them here. Each item in transpile can be a package name, a function, a string or regex object matching the dependency's file name.

You can also use a function to conditionally transpile. The function will receive an object ({ isDev, isServer, isClient, isModern, isLegacy }).

**Example**:
```js
      transpile: [({ isLegacy }) => isLegacy && 'ky']
```
## buildDir

- **Type**: `string`
- **Default:** `"/<rootDir>/.nuxt"`

> Define the directory where your built Nuxt files will be placed.

Many tools assume that `.nuxt` is a hidden directory (because it starts with a `.`). If that is a problem, you can use this option to prevent that.

**Example**:
```js
export default {
  buildDir: 'nuxt-build'
}
```
## builder

- **Type**: `string`
- **Default:** `"@nuxt/vite-builder"`

> The builder to use for bundling the Vue part of your application.

## components

- **Type**: `object`
- **Default**
```json
{
  "dirs": [
    "~/components"
  ]
}
```

> Configure Nuxt component auto-registration.

Any components in the directories configured here can be used throughout your pages, layouts (and other components) without needing to explicitly import them.

**Default**: {{ dirs: [`~/components`] }}
**See**: [Nuxt 3](https://v3.nuxtjs.org/docs/directory-structure/components) and
[Nuxt 2](https://nuxtjs.org/docs/directory-structure/components/) documentation
## css

- **Type**: `array`

> You can define the CSS files/modules/libraries you want to set globally (included in every page).

Nuxt will automatically guess the file type by its extension and use the appropriate pre-processor. You will still need to install the required loader if you need to use them.

**Example**:
```js
css: [
  // Load a Node.js module directly (here it's a Sass file)
  'bulma',
  // CSS file in the project
  '@/assets/css/main.css',
  // SCSS file in the project
  '@/assets/css/main.scss'
]
```
## dev

- **Type**: `boolean`
- **Default:** `false`

> Whether Nuxt is running in development mode.

Normally you should not need to set this.

## dir

> Customize default directory structure used by nuxt.

It is better to stick with defaults unless needed.


### `layouts`

- **Type**: `string`
- **Default:** `"layouts"`

> The layouts directory, each file of which will be auto-registered as a Nuxt layout.


### `middleware`

- **Type**: `string`
- **Default:** `"middleware"`

> The middleware directory, each file of which will be auto-registered as a Nuxt middleware.


### `pages`

- **Type**: `string`
- **Default:** `"pages"`

> The directory which will be processed to auto-generate your application page routes.


### `public`

- **Type**: `string`
- **Default:** `"public"`

> The directory containing your static files, which will be directly accessible via the Nuxt server and copied across into your `dist` folder when your app is generated.

## experimental


### `asyncEntry`

- **Type**: `boolean`
- **Default:** `false`

> Set to true to generate an async entrypoint for the Vue bundle (for module federation support).


### `reactivityTransform`

- **Type**: `boolean`
- **Default:** `false`

> Enable Vue's reactivity transform

**See**: https://vuejs.org/guide/extras/reactivity-transform.html

### `viteNode`

- **Type**: `boolean`
- **Default:** `false`

> Use vite-node for on-demand server chunk loading

## extends

- **Default:** `null`

> Extend nested configurations from multiple local or remote sources

Value should be either a string or array of strings pointing to source directories or config path relative to current config.
You can use `github:`, `gitlab:`, `bitbucket:` or `https://` to extend from a remote git repository.

## extensions

- **Type**: `array`
- **Default**
```json
[
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
  ".vue"
]
```

> The extensions that should be resolved by the Nuxt resolver.

## hooks

- **Default:** `null`

> Hooks are listeners to Nuxt events that are typically used in modules, but are also available in `nuxt.config`.

Internally, hooks follow a naming pattern using colons (e.g., build:done).
For ease of configuration, you can also structure them as an hierarchical object in `nuxt.config` (as below).

**Example**:
```js
import fs from 'fs'
import path from 'path'
export default {
  hooks: {
    build: {
      done(builder) {
        const extraFilePath = path.join(
          builder.nuxt.options.buildDir,
          'extra-file'
        )
        fs.writeFileSync(extraFilePath, 'Something extra')
      }
    }
  }
}
```
## ignore

- **Type**: `array`
- **Default**
```json
[
  "**/*.stories.{js,ts,jsx,tsx}",
  "**/*.{spec,test}.{js,ts,jsx,tsx}",
  ".output",
  "**/-*.*"
]
```

> More customizable than `ignorePrefix`: all files matching glob patterns specified inside the `ignore` array will be ignored in building.

## ignoreOptions


> Pass options directly to `node-ignore` (which is used by Nuxt to ignore files).

**See**: [node-ignore](https://github.com/kaelzhang/node-ignore)
**Example**:
```js
ignoreOptions: {
  ignorecase: false
}
```
## ignorePrefix

- **Type**: `string`
- **Default:** `"-"`

> Any file in `pages/`, `layouts/`, `middleware/` or `store/` will be ignored during building if its filename starts with the prefix specified by `ignorePrefix`.

## meta

> Set default configuration for `<head>` on every page.

**Example**:
```js
meta: {
 meta: [
   // <meta name="viewport" content="width=device-width, initial-scale=1">
   { name: 'viewport', content: 'width=device-width, initial-scale=1' }
 ],
 script: [
   // <script src="https://myawesome-lib.js"></script>
   { src: 'https://awesome-lib.js' }
 ],
 link: [
   // <link rel="stylesheet" href="https://myawesome-lib.css">
   { rel: 'stylesheet', href: 'https://awesome-lib.css' }
 ],
 // please note that this is an area that is likely to change
 style: [
   // <style type="text/css">:root { color: red }</style>
   { children: ':root { color: red }', type: 'text/css' }
 ]
}
```

### `link`

- **Type**: `array`


### `meta`

- **Type**: `array`


### `script`

- **Type**: `array`


### `style`

- **Type**: `array`

## modules

- **Type**: `array`

> Modules are Nuxt extensions which can extend its core functionality and add endless integrations

Each module is either a string (which can refer to a package, or be a path to a file), a tuple with the module as first string and the options as a second object, or an inline module function.
Nuxt tries to resolve each item in the modules array using node require path (in `node_modules`) and then will be resolved from project `srcDir` if `~` alias is used.

::alert{type="info"}
**Note**: Modules are executed sequentially so the order is important.
::

**Example**:
```js
modules: [
  // Using package name
  '@nuxtjs/axios',
  // Relative to your project srcDir
  '~/modules/awesome.js',
  // Providing options
  ['@nuxtjs/google-analytics', { ua: 'X1234567' }],
  // Inline definition
  function () {}
]
```
## nitro


> Configuration for Nuxt Nitro.

## postcss


### `config`

- **Type**: `boolean`
- **Default:** `false`

> Path to postcss config file.


### `plugins`

> Options for configuring PostCSS plugins.

https://postcss.org/


#### `autoprefixer`


> https://github.com/postcss/autoprefixer


#### `cssnano`

- **Type**: `boolean`
- **Default:** `false`


#### `postcss-import`

- **Type**: `object`

> https://github.com/postcss/postcss-import


#### `postcss-url`


> https://github.com/postcss/postcss-url

## privateRuntimeConfig


> Runtime config allows passing dynamic config and environment variables to the Nuxt app context.

The value of this object is accessible from server only using `$config` or `useRuntimeConfig`. It will override `publicRuntimeConfig` on the server-side.
It should hold _private_ environment variables (that should not be exposed on the frontend). This could include a reference to your API secret tokens.
Values are automatically replaced by matching env variables at runtime, e.g. setting an environment variable `API_SECRET=my-api-key` would overwrite the value in the example below. Note that the env variable has to be named exactly the same as the config key.

**Example**:
```js
export default {
  privateRuntimeConfig: {
    API_SECRET: '' // Default to an empty string, automatically loaded at runtime using process.env.API_SECRET
  }
}
```
## publicRuntimeConfig

- **Type**: `object`
- **Default**
```json
{
  "app": {
    "baseURL": "/",
    "buildAssetsDir": "/_nuxt/",
    "assetsPath": {},
    "cdnURL": null
  }
}
```

> Runtime config allows passing dynamic config and environment variables to the Nuxt app context.

The value of this object is accessible from both client and server using `$config` or `useRuntimeConfig`.
It should hold env variables that are _public_ as they will be accessible on the frontend. This could include a reference to your public URL.
Values are automatically replaced by matching env variables at runtime, e.g. setting an environment variable `BASE_URL=https://some-other-url.org` would overwrite the value in the example below. Note that the env variable has to be named exactly the same as the config key.

**Example**:
```js
export default {
  publicRuntimeConfig: {
    BASE_URL: 'https://nuxtjs.org'
  }
}
```
## rootDir

- **Type**: `string`
- **Default:** `"/<rootDir>"`

> Define the workspace directory of your application.

This property can be overwritten (for example, running `nuxt ./my-app/` will set the `rootDir` to the absolute path of `./my-app/` from the current/working directory.
It is normally not needed to configure this option.

## serverMiddleware

- **Type**: `array`

> Server middleware are connect/express/h3-shaped functions that handle server-side requests. They run on the server and before the Vue renderer.

By adding entries to `serverMiddleware` you can register additional routes without the need for an external server.
You can pass a string, which can be the name of a node dependency or a path to a file. You can also pass an object with `path` and `handler` keys. (`handler` can be a path or a function.)

::alert{type="info"}
**Note**: If you pass a function directly, it will only run in development mode.
::

**Example**:
```js
serverMiddleware: [
  // Will register redirect-ssl npm package
  'redirect-ssl',
  // Will register file from project server-middleware directory to handle /server-middleware/* requires
  { path: '/server-middleware', handler: '~/server-middleware/index.js' },
  // We can create custom instances too, but only in development mode, they are ignored for the production bundle.
  { path: '/static2', handler: serveStatic(__dirname + '/static2') }
]
```
::alert{type="info"}
**Note**: If you don't want middleware to run on all routes you should use the object
form with a specific path.
::

<!-- If you pass a string handler, Nuxt will expect that file to export a default function
that handles `(req, res, next) => void`. -->
**Example**:
```js
export default function (req, res, next) {
  // req is the Node.js http request object
  console.log(req.url)
  // res is the Node.js http response object
  // next is a function to call to invoke the next middleware
  // Don't forget to call next at the end if your middleware is not an endpoint!
  next()
}
```
<!-- Alternatively, it can export a connect/express/h3-type app instance. -->
**Example**:
```js
import bodyParser from 'body-parser'
import createApp from 'express'
const app = createApp()
app.use(bodyParser.json())
app.all('/getJSON', (req, res) => {
  res.json({ data: 'data' })
})
export default app
```
<!-- Alternatively, instead of passing an array of `serverMiddleware`, you can pass an object
whose keys are the paths and whose values are the handlers (string or function). -->
**Example**:
```js
export default {
  serverMiddleware: {
    '/a': '~/server-middleware/a.js',
    '/b': '~/server-middleware/b.js',
    '/c': '~/server-middleware/c.js'
  }
}
```
## srcDir

- **Type**: `string`
- **Default:** `"/<rootDir>"`

> Define the source directory of your Nuxt application.

If a relative path is specified it will be relative to the `rootDir`.

**Example**:
```js
export default {
  srcDir: 'client/'
}
```
This would work with the following folder structure:
```bash
-| app/
---| node_modules/
---| nuxt.config.js
---| package.json
---| client/
------| assets/
------| components/
------| layouts/
------| middleware/
------| pages/
------| plugins/
------| static/
------| store/
```
## ssr

- **Type**: `boolean`
- **Default:** `true`

> Whether to enable rendering of HTML - either dynamically (in server mode) or at generate time. If set to `false` and combined with `static` target, generated pages will simply display a loading screen with no content.

## typescript

> Configuration for Nuxt's TypeScript integration.


### `shim`

- **Type**: `boolean`
- **Default:** `true`

> Generate a `*.vue` shim.

We recommend instead either enabling [**Take Over Mode**](https://github.com/johnsoncodehk/volar/discussions/471) or adding **TypeScript Vue Plugin (Volar)** 👉 [[Download](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin)].


### `strict`

- **Type**: `boolean`
- **Default:** `false`

> TypeScript comes with certain checks to give you more safety and analysis of your program. Once you’ve converted your codebase to TypeScript, you can start enabling these checks for greater safety. [Read More](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html#getting-stricter-checks)


### `tsConfig`


> You can extend generated `.nuxt/tsconfig.json` using this option

## vite

> Configuration that will be passed directly to Vite.

See https://vitejs.dev/config for more information. Please note that not all vite options are supported in Nuxt.


### `base`

- **Type**: `string`
- **Default:** `"/_nuxt/"`


### `build`


#### `assetsDir`

- **Type**: `string`
- **Default:** `"."`


#### `emptyOutDir`

- **Type**: `boolean`
- **Default:** `false`


### `clearScreen`

- **Type**: `boolean`
- **Default:** `false`


### `define`

- **Type**: `object`
- **Default**
```json
{
  "process.dev": false
}
```


### `esbuild`


#### `jsxFactory`

- **Type**: `string`
- **Default:** `"h"`


#### `jsxFragment`

- **Type**: `string`
- **Default:** `"Fragment"`


#### `tsconfigRaw`

- **Type**: `string`
- **Default:** `"{}"`


### `logLevel`

- **Type**: `string`
- **Default:** `"warn"`


### `mode`

- **Type**: `string`
- **Default:** `"production"`


### `optimizeDeps`


#### `exclude`

- **Type**: `array`
- **Default**
```json
[
  "vue-demi"
]
```


### `publicDir`

- **Type**: `string`
- **Default:** `"/<rootDir>/public"`


### `resolve`


#### `extensions`

- **Type**: `array`
- **Default**
```json
[
  ".mjs",
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".vue"
]
```


### `root`

- **Type**: `string`
- **Default:** `"/<rootDir>"`


### `server`


#### `fs`


##### `allow`

- **Type**: `array`
- **Default**
```json
[
  "/<rootDir>/.nuxt",
  "/<rootDir>",
  "/<rootDir>",
  "/<rootDir>/node_modules",
  "/home/pooya/Code/framework/packages/schema/node_modules"
]
```


##### `strict`

- **Type**: `boolean`
- **Default:** `false`


### `vue`


#### `isProduction`

- **Type**: `boolean`
- **Default:** `true`


#### `template`


##### `compilerOptions`

- **Type**: `object`

## vue

> Vue.js config


### `compilerOptions`


> Options for the Vue compiler that will be passed at build time

**See**: [documentation](https://vuejs.org/api/application.html#app-config-compileroptions)
## watchers

> The watchers property lets you overwrite watchers configuration in your `nuxt.config`.


### `chokidar`

> Options to pass directly to `chokidar`.

**See**: [chokidar](https://github.com/paulmillr/chokidar#api)

#### `ignoreInitial`

- **Type**: `boolean`
- **Default:** `true`


### `rewatchOnRawEvents`


> An array of event types, which, when received, will cause the watcher to restart.


### `webpack`

> `watchOptions` to pass directly to webpack.

**See**: [webpack@4 watch options](https://v4.webpack.js.org/configuration/watch/#watchoptions).

#### `aggregateTimeout`

- **Type**: `number`
- **Default:** `1000`

## webpack


### `aggressiveCodeRemoval`

- **Type**: `boolean`
- **Default:** `false`

> Hard-replaces `typeof process`, `typeof window` and `typeof document` to tree-shake bundle.


### `analyze`

- **Type**: `boolean`
- **Default:** `false`

> Nuxt uses `webpack-bundle-analyzer` to visualize your bundles and how to optimize them.

Set to `true` to enable bundle analysis, or pass an object with options: [for webpack](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin) or [for vite](https://github.com/btd/rollup-plugin-visualizer#options).

**Example**:
```js
analyze: {
  analyzerMode: 'static'
}
```

### `cssSourceMap`

- **Type**: `boolean`
- **Default:** `false`

> Enables CSS source map support (defaults to true in development)


### `devMiddleware`

> See [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) for available options.


#### `stats`

- **Type**: `string`
- **Default:** `"none"`


### `extractCSS`

- **Type**: `boolean`
- **Default:** `false`

> Enables Common CSS Extraction using [Vue Server Renderer guidelines](https://ssr.vuejs.org/guide/css.html).

Using [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin/) under the hood, your CSS will be extracted into separate files, usually one per component. This allows caching your CSS and JavaScript separately and is worth trying if you have a lot of global or shared CSS.

**Example**:
```js
export default {
  build: {
    extractCSS: true,
    // or
    extractCSS: {
      ignoreOrder: true
    }
  }
}
```
<!-- If you want to extract all your CSS to a single file, there is a workaround for this.
However, note that it is not recommended to extract everything into a single file.
Extracting into multiple CSS files is better for caching and preload isolation. It
can also improve page performance by downloading and resolving only those resources
that are needed. -->
**Example**:
```js
export default {
  build: {
    extractCSS: true,
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|vue)$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    }
  }
}
```

### `filenames`

> Customize bundle filenames.

To understand a bit more about the use of manifests, take a look at [this webpack documentation](https://webpack.js.org/guides/code-splitting/).

::alert{type="info"}
**Note**: Be careful when using non-hashed based filenames in production
as most browsers will cache the asset and not detect the changes on first load.
::

<!-- This example changes fancy chunk names to numerical ids: -->
**Example**:
```js
filenames: {
  chunk: ({ isDev }) => (isDev ? '[name].js' : '[id].[contenthash].js')
}
```

#### `app`

- **Type**: `function`


#### `chunk`

- **Type**: `function`


#### `css`

- **Type**: `function`


#### `font`

- **Type**: `function`


#### `img`

- **Type**: `function`


#### `video`

- **Type**: `function`


### `friendlyErrors`

- **Type**: `boolean`
- **Default:** `true`

> Set to `false` to disable the overlay provided by [FriendlyErrorsWebpackPlugin](https://github.com/nuxt/friendly-errors-webpack-plugin)


### `hotMiddleware`


> See [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) for available options.


### `loaders`

> Customize the options of Nuxt's integrated webpack loaders.


#### `css`


##### `esModule`

- **Type**: `boolean`
- **Default:** `false`


##### `importLoaders`

- **Type**: `number`
- **Default:** `0`


##### `url`


###### `filter`

- **Type**: `function`


#### `cssModules`


##### `esModule`

- **Type**: `boolean`
- **Default:** `false`


##### `importLoaders`

- **Type**: `number`
- **Default:** `0`


##### `modules`


###### `localIdentName`

- **Type**: `string`
- **Default:** `"[local]_[hash:base64:5]"`


##### `url`


###### `filter`

- **Type**: `function`


#### `file`


##### `esModule`

- **Type**: `boolean`
- **Default:** `false`


#### `fontUrl`


##### `esModule`

- **Type**: `boolean`
- **Default:** `false`


##### `limit`

- **Type**: `number`
- **Default:** `1000`


#### `imgUrl`


##### `esModule`

- **Type**: `boolean`
- **Default:** `false`


##### `limit`

- **Type**: `number`
- **Default:** `1000`


#### `less`

- **Default**
```json
{
  "sourceMap": false
}
```


#### `pugPlain`



#### `sass`


##### `sassOptions`


###### `indentedSyntax`

- **Type**: `boolean`
- **Default:** `true`


#### `scss`

- **Default**
```json
{
  "sourceMap": false
}
```


#### `stylus`

- **Default**
```json
{
  "sourceMap": false
}
```


#### `vue`


##### `compilerOptions`

- **Type**: `object`


##### `productionMode`

- **Type**: `boolean`
- **Default:** `true`


##### `transformAssetUrls`


###### `embed`

- **Type**: `string`
- **Default:** `"src"`


###### `object`

- **Type**: `string`
- **Default:** `"src"`


###### `source`

- **Type**: `string`
- **Default:** `"src"`


###### `video`

- **Type**: `string`
- **Default:** `"src"`


#### `vueStyle`

- **Default**
```json
{
  "sourceMap": false
}
```


### `optimization`

> Configure [webpack optimization](https://webpack.js.org/configuration/optimization/).


#### `minimize`

- **Type**: `boolean`
- **Default:** `true`

> Set minimize to false to disable all minimizers. (It is disabled in development by default)


#### `minimizer`


> You can set minimizer to a customized array of plugins.


#### `runtimeChunk`

- **Type**: `string`
- **Default:** `"single"`


#### `splitChunks`


##### `automaticNameDelimiter`

- **Type**: `string`
- **Default:** `"/"`


##### `cacheGroups`



##### `chunks`

- **Type**: `string`
- **Default:** `"all"`


### `optimizeCSS`

- **Type**: `boolean`
- **Default:** `false`

> OptimizeCSSAssets plugin options.

Defaults to true when `extractCSS` is enabled.

**See**: [css-minimizer-webpack-plugin documentation](https://github.com/webpack-contrib/css-minimizer-webpack-plugin).

### `plugins`

- **Type**: `array`

> Add webpack plugins.

**Example**:
```js
import webpack from 'webpack'
import { version } from './package.json'
// ...
plugins: [
  new webpack.DefinePlugin({
    'process.VERSION': version
  })
]
```

### `postcss`

> Customize PostCSS Loader. Same options as https://github.com/webpack-contrib/postcss-loader#options


#### `execute`

- **Type**: `undefined`


#### `implementation`

- **Type**: `undefined`


#### `order`

- **Type**: `string`
- **Default:** `""`


#### `postcssOptions`


##### `config`

- **Type**: `boolean`
- **Default:** `false`


##### `plugins`

- **Type**: `object`
- **Default**
```json
{
  "postcss-import": {},
  "postcss-url": {},
  "autoprefixer": {},
  "cssnano": false
}
```


#### `sourceMap`

- **Type**: `undefined`


### `profile`

- **Type**: `boolean`
- **Default:** `false`

> Enable the profiler in webpackbar.

It is normally enabled by CLI argument `--profile`.

**See**: [webpackbar](https://github.com/unjs/webpackbar#profile)

### `serverURLPolyfill`

- **Type**: `string`
- **Default:** `"url"`

> The polyfill library to load to provide URL and URLSearchParams.

Defaults to `'url'` ([see package](https://www.npmjs.com/package/url)).


### `terser`


> Terser plugin options.

Set to false to disable this plugin, or pass an object of options.

**See**: [terser-webpack-plugin documentation](https://github.com/webpack-contrib/terser-webpack-plugin)
::alert{type="info"}
**Note**: Enabling sourceMap will leave `//# sourceMappingURL` linking comment at
the end of each output file if webpack `config.devtool` is set to `source-map`.
::


### `warningIgnoreFilters`

- **Type**: `array`

> Filters to hide build warnings.


