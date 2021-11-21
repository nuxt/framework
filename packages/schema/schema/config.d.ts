import type { ComponentsOptions } from '../src/types/components'
import type { AutoImportsOptions } from '../src/types/imports'
import type { NuxtPlugin } from '../src/types/nuxt'
import type { ModuleInstallOptions } from '../src/types/module'
import type { NuxtHooks } from '../src/types/hooks'
import type { PrivateRuntimeConfig, PublicRuntimeConfig } from '../src/types/config'
import type { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer'
import type { InlineConfig } from 'vite'
export interface ConfigSchema {
   /**
   * Configure Nuxt component auto-registration.
   * Any components in the directories configured here can be used throughout your pages, layouts (and other components) without needing to explicitly import them.
   * 
   * @default {{ dirs: [`~/components`] }}
   * 
   * @see [Nuxt 3](https://v3.nuxtjs.org/docs/directory-structure/components) and
   * [Nuxt 2](https://nuxtjs.org/docs/directory-structure/components/) documentation
  */
  components: boolean | ComponentsOptions | ComponentsOptions['dirs'],

  /**
   * Configure how Nuxt auto-imports composables into your application.
   * 
   * @see [Nuxt 3 documentation](https://v3.nuxtjs.org/docs/directory-structure/composables)
  */
  autoImports: AutoImportsOptions,

  /** Vue.js config */
  vue: {
    /**
     * Properties that will be set directly on `Vue.config` for vue@2.
     * 
     * @see [vue@2 Documentation](https://vuejs.org/v2/api/#Global-Config)
     * 
     * @version 2
    */
    config: import('vue/types/vue').VueConfiguration,

    /**
     * Options for the Vue compiler that will be passed at build time
     * 
     * @see [documentation](https://v3.vuejs.org/api/application-config.html)
     * 
     * @version 3
    */
    compilerOptions: import('@vue/compiler-core').CompilerOptions,
  },

  /**
   * Nuxt App configuration.
   * 
   * @version 2
  */
  app: {
    [key: string]: any
  },

  /**
   * The path to a templated HTML file for rendering Nuxt responses. Uses `<srcDir>/app.html` if it exists or the Nuxt default template if not.
   * @default "/project/.nuxt/views/app.template.html"
   * 
   * @example
   * ```html
   * <!DOCTYPE html>
   * <html {{ HTML_ATTRS }}>
   *   <head {{ HEAD_ATTRS }}>
   *     {{ HEAD }}
   *   </head>
   *   <body {{ BODY_ATTRS }}>
   *     {{ APP }}
   *   </body>
   * </html>
   * ```
   * 
   * @version 2
  */
  appTemplatePath: string,

  /**
   * Enable or disable vuex store.
   * By default it is enabled if there is a `store/` directory
   * @default false
   * 
   * @version 2
  */
  store: boolean,

  /**
   * Options to pass directly to `vue-meta`.
   * 
   * @see [documentation](https://vue-meta.nuxtjs.org/api/#plugin-options).
   * 
   * @version 2
  */
  vueMeta: import('vue-meta').VueMetaOptions,

  /**
   * Set default configuration for `<head>` on every page.
   * 
   * @see [documentation](https://vue-meta.nuxtjs.org/api/#metainfo-properties) for specifics.
   * 
   * @version 2
  */
  head: import('vue-meta').MetaInfo,

  /**
   * Set default configuration for `<head>` on every page.
   * 
   * @example
   * ```js
   * meta: {
   *  meta: [
   *    // <meta name="viewport" content="width=device-width, initial-scale=1">
   *    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
   *  ],
   *  script: [
   *    // <script src="https://myawesome-lib.js"></script>
   *    { src: 'https://awesome-lib.js' }
   *  ],
   *  link: [
   *    // <link rel="stylesheet" href="https://myawesome-lib.css">
   *    { rel: 'stylesheet', href: 'https://awesome-lib.css' }
   *  ],
   *  // please note that this is an area that is likely to change
   *  style: [
   *    // <style type="text/css">:root { color: red }</style>
   *    { children: ':root { color: red }', type: 'text/css' }
   *  ]
   * }
   * ```
   * 
   * @version 3
  */
  meta: import('nuxt3/dist/meta/runtime/types').MetaObject,

  /**
   * Configuration for the Nuxt `fetch()` hook.
   * 
   * @version 2
  */
  fetch: {
    /**
     * Whether to enable `fetch()` on the server.
     * @default true
    */
    server: boolean,

    /**
     * Whether to enable `fetch()` on the client.
     * @default true
    */
    client: boolean,
  },

  /**
   * An array of nuxt app plugins.
   * Each plugin can be a string (which can be an absolute or relative path to a file). If it ends with `.client` or `.server` then it will be automatically loaded only in the appropriate context.
   * It can also be an object with `src` and `mode` keys.
   * 
   * @example
   * ```js
   * plugins: [
   *   '~/plugins/foo.client.js', // only in client side
   *   '~/plugins/bar.server.js', // only in server side
   *   '~/plugins/baz.js', // both client & server
   *   { src: '~/plugins/both-sides.js' },
   *   { src: '~/plugins/client-only.js', mode: 'client' }, // only on client side
   *   { src: '~/plugins/server-only.js', mode: 'server' } // only on server side
   * ]
   * ```
   * 
   * @version 2
  */
  plugins: NuxtPlugin[],

  /**
   * You may want to extend plugins or change their order. For this, you can pass a function using `extendPlugins`. It accepts an array of plugin objects and should return an array of plugin objects.
   * 
   * @version 2
  */
  extendPlugins: (plugins: Array<{ src: string, mode?: 'client' | 'server' }>) => Array<{ src: string, mode?: 'client' | 'server' }>,

  /**
   * You can define the CSS files/modules/libraries you want to set globally (included in every page).
   * Nuxt will automatically guess the file type by its extension and use the appropriate pre-processor. You will still need to install the required loader if you need to use them.
   * 
   * @example
   * ```js
   * css: [
   *   // Load a Node.js module directly (here it's a Sass file)
   *   'bulma',
   *   // CSS file in the project
   *   '@/assets/css/main.css',
   *   // SCSS file in the project
   *   '@/assets/css/main.scss'
   * ]
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  css: string[],

  /**
   * An object where each key name maps to a path to a layout .vue file.
   * Normally there is no need to configure this directly.
   * 
   * @version 2
  */
  layouts: Record<string, string>,

  /**
   * Set a custom error page layout.
   * Normally there is no need to configure this directly.
   * @default null
   * 
   * @version 2
  */
  ErrorPage: string,

  /**
   * Configure the Nuxt loading progress bar component that's shown between routes. Set to `false` to disable. You can also customize it or create your own component.
   * 
   * @version 2
  */
  loading: {
    /**
     * CSS color of the progress bar
     * @default "black"
    */
    color: string,

    /**
     * CSS color of the progress bar when an error appended while rendering the route (if data or fetch sent back an error for example).
     * @default "red"
    */
    failedColor: string,

    /**
     * Height of the progress bar (used in the style property of the progress bar).
     * @default "2px"
    */
    height: string,

    /**
     * In ms, wait for the specified time before displaying the progress bar. Useful for preventing the bar from flashing.
     * @default 200
    */
    throttle: number,

    /**
     * In ms, the maximum duration of the progress bar, Nuxt assumes that the route will be rendered before 5 seconds.
     * @default 5000
    */
    duration: number,

    /**
     * Keep animating progress bar when loading takes longer than duration.
     * @default false
    */
    continuous: boolean,

    /**
     * Set the direction of the progress bar from right to left.
     * @default false
    */
    rtl: boolean,

    /**
     * Set to false to remove default progress bar styles (and add your own).
     * @default true
    */
    css: boolean,
  },

  /**
   * Show a loading spinner while the page is loading (only when `ssr: false`).
   * Set to `false` to disable. Alternatively, you can pass a string name or an object for more configuration. The name can refer to an indicator from [SpinKit](https://tobiasahlin.com/spinkit/) or a path to an HTML template of the indicator source code (in this case, all the other options will be passed to the template.)
   * 
   * @version 2
  */
  loadingIndicator: {
    [key: string]: any
  },

  /**
   * Used to set the default properties of the page transitions.
   * You can either pass a string (the transition name) or an object with properties to bind to the `<Transition>` component that will wrap your pages.
   * 
   * @see [vue@2 documentation](https://vuejs.org/v2/guide/transitions.html)
   * 
   * @see [vue@3 documentation](https://v3.vuejs.org/guide/transitions-enterleave.html)
   * 
   * @version 2
  */
  pageTransition: {
    [key: string]: any
  },

  /**
   * Used to set the default properties of the layout transitions.
   * You can either pass a string (the transition name) or an object with properties to bind to the `<Transition>` component that will wrap your layouts.
   * 
   * @see [vue@2 documentation](https://vuejs.org/v2/guide/transitions.html)
   * 
   * @see [vue@3 documentation](https://v3.vuejs.org/guide/transitions-enterleave.html)
   * 
   * @version 2
  */
  layoutTransition: {
    [key: string]: any
  },

  /**
   * You can disable specific Nuxt features that you do not want.
   * 
   * @version 2
  */
  features: {
    /**
     * Set to false to disable Nuxt vuex integration
     * @default true
    */
    store: boolean,

    /**
     * Set to false to disable layouts
     * @default true
    */
    layouts: boolean,

    /**
     * Set to false to disable Nuxt integration with `vue-meta` and the `head` property
     * @default true
    */
    meta: boolean,

    /**
     * Set to false to disable middleware
     * @default true
    */
    middleware: boolean,

    /**
     * Set to false to disable transitions
     * @default true
    */
    transitions: boolean,

    /**
     * Set to false to disable support for deprecated features and aliases
     * @default true
    */
    deprecations: boolean,

    /**
     * Set to false to disable the Nuxt `validate()` hook
     * @default true
    */
    validate: boolean,

    /**
     * Set to false to disable the Nuxt `asyncData()` hook
     * @default true
    */
    useAsyncData: boolean,

    /**
     * Set to false to disable the Nuxt `fetch()` hook
     * @default true
    */
    fetch: boolean,

    /**
     * Set to false to disable `$nuxt.isOnline`
     * @default true
    */
    clientOnline: boolean,

    /**
     * Set to false to disable prefetching behavior in `<NuxtLink>`
     * @default true
    */
    clientPrefetch: boolean,

    /**
     * Set to false to disable extra component aliases like `<NLink>` and `<NChild>`
     * @default true
    */
    componentAliases: boolean,

    /**
     * Set to false to disable the `<ClientOnly>` component (see [docs](https://github.com/egoist/vue-client-only))
     * @default true
    */
    componentClientOnly: boolean,
  },

  /**
   * Define the workspace directory of your application.
   * This property can be overwritten (for example, running `nuxt ./my-app/` will set the `rootDir` to the absolute path of `./my-app/` from the current/working directory.
   * It is normally not needed to configure this option.
   * @default "/project"
   * 
   * @version 2
   * 
   * @version 3
  */
  rootDir: string,

  /**
   * Define the source directory of your Nuxt application.
   * If a relative path is specified it will be relative to the `rootDir`.
   * @default "/project"
   * 
   * @example
   * ```js
   * export default {
   *   srcDir: 'client/'
   * }
   * ```
   * This would work with the following folder structure:
   * ```bash
   * -| app/
   * ---| node_modules/
   * ---| nuxt.config.js
   * ---| package.json
   * ---| client/
   * ------| assets/
   * ------| components/
   * ------| layouts/
   * ------| middleware/
   * ------| pages/
   * ------| plugins/
   * ------| static/
   * ------| store/
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  srcDir: string,

  /**
   * Define the directory where your built Nuxt files will be placed.
   * Many tools assume that `.nuxt` is a hidden directory (because it starts with a `.`). If that is a problem, you can use this option to prevent that.
   * @default "/project/.nuxt"
   * 
   * @example
   * ```js
   * export default {
   *   buildDir: 'nuxt-build'
   * }
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  buildDir: string,

  /**
   * Whether Nuxt is running in development mode.
   * Normally you should not need to set this.
   * @default false
   * 
   * @version 2
   * 
   * @version 3
  */
  dev: boolean,

  /**
   * Whether your app is being unit tested
   * @default false
   * 
   * @version 2
  */
  test: boolean,

  /**
   * Set to true to enable debug mode.
   * By default it's only enabled in development mode.
   * @default false
   * 
   * @version 2
  */
  debug: boolean,

  /**
   * The env property defines environment variables that should be available throughout your app (server- and client-side). They can be assigned using server side environment variables.
   * 
   * @note Nuxt uses webpack's `definePlugin` to define these environment variables.
   * This means that the actual `process` or `process.env` from Node.js is neither
   * available nor defined. Each of the `env` properties defined here is individually
   * mapped to `process.env.xxxx` and converted during compilation.
   * 
   * @note Environment variables starting with `NUXT_ENV_` are automatically injected
   * into the process environment.
   * 
   * @version 2
  */
  env: {
    [key: string]: any
  },

  /**
   * Set the method Nuxt uses to require modules, such as loading `nuxt.config`, server middleware, and so on - defaulting to `jiti` (which has support for TypeScript and ESM syntax).
   * 
   * @see [jiti](https://github.com/unjs/jiti)
   * 
   * @version 2
  */
  createRequire: 'jiti' | 'native' | ((p: string | { filename: string }) => NodeRequire),

  /**
   * Whether your Nuxt app should be built to be served by the Nuxt server (`server`) or as static HTML files suitable for a CDN or other static file server (`static`).
   * This is unrelated to `ssr`.
   * @default "server"
   * 
   * @version 2
  */
  target: 'server' | 'static',

  /**
   * Whether to enable rendering of HTML - either dynamically (in server mode) or at generate time. If set to `false` and combined with `static` target, generated pages will simply display a loading screen with no content.
   * @default true
   * 
   * @version 2
   * 
   * @version 3
  */
  ssr: boolean,

  /**
   * @default "spa"
   * 
   * @deprecated `mode` option is deprecated
   * 
   * @deprecated use ssr option
  */
  mode: string,

  /**
   * Whether to produce a separate modern build targeting browsers that support ES modules.
   * Set to `'server'` to enable server mode, where the Nuxt server checks browser version based on the user agent and serves the correct bundle.
   * Set to `'client'` to serve both the modern bundle with `<script type="module">` and the legacy bundle with `<script nomodule>`. It will also provide a `<link rel="modulepreload">` for the modern bundle. Every browser that understands the module type will load the modern bundle while older browsers fall back to the legacy (transpiled) bundle.
   * If you have set `modern: true` and are generating your app or have `ssr: false`, modern will be set to `'client'`.
   * If you have set `modern: true` and are serving your app, modern will be set to `'server'`.
   * 
   * @see [concept of modern mode](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)
   * 
   * @version 2
  */
  modern: 'server' | 'client' | boolean,

  /**
   * Modules are Nuxt extensions which can extend its core functionality and add endless integrations
   * Each module is either a string (which can refer to a package, or be a path to a file), a tuple with the module as first string and the options as a second object, or an inline module function.
   * Nuxt tries to resolve each item in the modules array using node require path (in `node_modules`) and then will be resolved from project `srcDir` if `~` alias is used.
   * 
   * @note Modules are executed sequentially so the order is important.
   * 
   * @example
   * ```js
   * modules: [
   *   // Using package name
   *   '@nuxtjs/axios',
   *   // Relative to your project srcDir
   *   '~/modules/awesome.js',
   *   // Providing options
   *   ['@nuxtjs/google-analytics', { ua: 'X1234567' }],
   *   // Inline definition
   *   function () {}
   * ]
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  modules: ModuleInstallOptions[],

  /**
   * Modules that are only required during development and build time.
   * Modules are Nuxt extensions which can extend its core functionality and add endless integrations
   * Each module is either a string (which can refer to a package, or be a path to a file), a tuple with the module as first string and the options as a second object, or an inline module function.
   * Nuxt tries to resolve each item in the modules array using node require path (in `node_modules`) and then will be resolved from project `srcDir` if `~` alias is used.
   * 
   * @note Modules are executed sequentially so the order is important.
   * 
   * @example
   * ```js
   * modules: [
   *   // Using package name
   *   '@nuxtjs/axios',
   *   // Relative to your project srcDir
   *   '~/modules/awesome.js',
   *   // Providing options
   *   ['@nuxtjs/google-analytics', { ua: 'X1234567' }],
   *   // Inline definition
   *   function () {}
   * ]
   * ```
   * 
   * @note Using `buildModules` helps to make production startup faster and also significantly
   * decreases the size of `node_modules` in production deployments. Please refer to each
   * module's documentation to see if it is recommended to use `modules` or `buildModules`.
   * 
   * @version 2
   * 
   * @version 3
  */
  buildModules: ModuleInstallOptions[],

  /**
   * Built-in ad-hoc modules
   *  @private
  */
  _modules: Array<any>,

  /**
   * Allows customizing the global ID used in the main HTML template as well as the main Vue instance name and other options.
   * @default "nuxt"
   * 
   * @version 2
  */
  globalName: string,

  /**
   * Customizes specific global names (they are based on `globalName` by default).
   * 
   * @version 2
  */
  globals: {
    id: (globalName: string) => string,

    nuxt: (globalName: string) => string,

    context: (globalName: string) => string,

    pluginPrefix: (globalName: string) => string,

    readyCallback: (globalName: string) => string,

    loadedCallback: (globalName: string) => string,
  },

  /**
   * Server middleware are connect/express/h3-shaped functions that handle server-side requests. They run on the server and before the Vue renderer.
   * By adding entries to `serverMiddleware` you can register additional routes or modify `req`/`res` objects without the need for an external server.
   * You can pass a string, which can be the name of a node dependency or a path to a file. You can also pass an object with `path` and `handler` keys. (`handler` can be a path or a function.)
   * 
   * @example
   * ```js
   * serverMiddleware: [
   *   // Will register redirect-ssl npm package
   *   'redirect-ssl',
   *   // Will register file from project server-middleware directory to handle /server-middleware/* requires
   *   { path: '/server-middleware', handler: '~/server-middleware/index.js' },
   *   // We can create custom instances too
   *   { path: '/static2', handler: serveStatic(__dirname + '/static2') }
   * ]
   * ```
   * 
   * @note If you don't want middleware to run on all routes you should use the object
   * form with a specific path.
   * 
   * If you pass a string handler, Nuxt will expect that file to export a default function
   * that handles `(req, res, next) => void`.
   * 
   * @example
   * ```js
   * export default function (req, res, next) {
   *   // req is the Node.js http request object
   *   console.log(req.url)
   *   // res is the Node.js http response object
   *   // next is a function to call to invoke the next middleware
   *   // Don't forget to call next at the end if your middleware is not an endpoint!
   *   next()
   * }
   * ```
   * 
   * Alternatively, it can export a connect/express/h3-type app instance.
   * 
   * @example
   * ```js
   * const bodyParser = require('body-parser')
   * const app = require('express')()
   * app.use(bodyParser.json())
   * app.all('/getJSON', (req, res) => {
   *   res.json({ data: 'data' })
   * })
   * module.exports = app
   * ```
   * 
   * Alternatively, instead of passing an array of `serverMiddleware`, you can pass an object
   * whose keys are the paths and whose values are the handlers (string or function).
   * 
   * @example
   * ```js
   * export default {
   *   serverMiddleware: {
   *     '/a': '~/server-middleware/a.js',
   *     '/b': '~/server-middleware/b.js',
   *     '/c': '~/server-middleware/c.js'
   *   }
   * }
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  serverMiddleware: Array<any>,

  /**
   * Used to set the modules directories for path resolving (for example, webpack's `resolveLoading`, `nodeExternals` and `postcss`).
   * The configuration path is relative to `options.rootDir` (default is current working directory).
   * Setting this field may be necessary if your project is organized as a yarn workspace-styled mono-repository.
   * @default ["/project/node_modules","/home/pooya/Code/framework/packages/schema/node_modules"]
   * 
   * @example
   * ```js
   * export default {
   *   modulesDir: ['../../node_modules']
   * }
   * ```
   * 
   * @version 2
  */
  modulesDir: Array<string>,

  /**
   * Customize default directory structure used by nuxt.
   * It is better to stick with defaults unless needed.
   * 
   * @version 2
   * 
   * @version 3
  */
  dir: {
    /**
     * The assets directory (aliased as `~assets` in your build)
     * @default "assets"
     * 
     * @version 2
    */
    assets: string,

    /**
     * The directory containing app template files like `app.html` and `router.scrollBehavior.js`
     * @default "app"
     * 
     * @version 2
    */
    app: string,

    /**
     * The layouts directory, each file of which will be auto-registered as a Nuxt layout.
     * @default "layouts"
     * 
     * @version 2
     * 
     * @version 3
    */
    layouts: string,

    /**
     * The middleware directory, each file of which will be auto-registered as a Nuxt middleware.
     * @default "middleware"
     * 
     * @version 2
    */
    middleware: string,

    /**
     * The directory which will be processed to auto-generate your application page routes.
     * @default "pages"
     * 
     * @version 2
     * 
     * @version 3
    */
    pages: string,

    /**
     * The directory containing your static files, which will be directly accessible via the Nuxt server and copied across into your `dist` folder when your app is generated.
     * @default "public"
     * 
     * @version 3
    */
    public: string,

    /**
     * @default "public"
     * 
     * @deprecated use `dir.public` option instead
     * 
     * @version 2
    */
    static: string,

    /**
     * The folder which will be used to auto-generate your Vuex store structure.
     * @default "store"
     * 
     * @version 2
    */
    store: string,
  },

  /**
   * The extensions that should be resolved by the Nuxt resolver.
   * @default [".js",".jsx",".mjs",".ts",".tsx",".vue"]
   * 
   * @version 2
   * 
   * @version 3
  */
  extensions: Array<string>,

  /**
   * The style extensions that should be resolved by the Nuxt resolver (for example, in `css` property).
   * @default [".css",".pcss",".postcss",".styl",".stylus",".scss",".sass",".less"]
   * 
   * @version 2
  */
  styleExtensions: Array<string>,

  /**
   * You can improve your DX by defining additional aliases to access custom directories within your JavaScript and CSS.
   * 
   * @note Within a webpack context (image sources, CSS - but not JavaScript) you _must_ access
   * your alias by prefixing it with `~`.
   * 
   * @note If you are using TypeScript and want to use the alias you define within
   * your TypeScript files, you will need to add the aliases to your `paths` object within `tsconfig.json` .
   * 
   * @example
   * ```js
   * import { resolve } from 'pathe'
   * export default {
   *   alias: {
   *     'images': resolve(__dirname, './assets/images'),
   *     'style': resolve(__dirname, './assets/style'),
   *     'data': resolve(__dirname, './assets/other/data')
   *   }
   * }
   * ```
   * 
   * ```html
   * <template>
   *   <img src="~images/main-bg.jpg">
   * </template>
   * 
   * <script>
   * import data from 'data/test.json'
   * </script>
   * 
   * <style>
   * // Uncomment the below
   * //@import '~style/variables.scss';
   * //@import '~style/utils.scss';
   * //@import '~style/base.scss';
   * body {
   *   background-image: url('~images/main-bg.jpg');
   * }
   * </style>
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  alias: Record<string, string>,

  /**
   * Pass options directly to `node-ignore` (which is used by Nuxt to ignore files).
   * 
   * @see [node-ignore](https://github.com/kaelzhang/node-ignore)
   * 
   * @example
   * ```js
   * ignoreOptions: {
   *   ignorecase: false
   * }
   * ```
   * 
   * @version 2
  */
  ignoreOptions: any,

  /**
   * Any file in `pages/`, `layouts/`, `middleware/` or `store/` will be ignored during building if its filename starts with the prefix specified by `ignorePrefix`.
   * @default "-"
   * 
   * @version 2
  */
  ignorePrefix: string,

  /**
   * More customizable than `ignorePrefix`: all files matching glob patterns specified inside the `ignore` array will be ignored in building.
   * @default ["**\/*.test.*","**\/*.spec.*","**\/-*.*"]
   * 
   * @version 2
  */
  ignore: Array<string>,

  /**
   * The watch property lets you watch custom files for restarting the server.
   * `chokidar` is used to set up the watchers. To learn more about its pattern options, see chokidar documentation.
   * 
   * @see [chokidar](https://github.com/paulmillr/chokidar#api)
   * 
   * @example
   * ```js
   * watch: ['~/custom/*.js']
   * ```
   * 
   * @version 2
  */
  watch: string[],

  /**
   * The watchers property lets you overwrite watchers configuration in your `nuxt.config`.
   * 
   * @version 2
   * 
   * @version 3
  */
  watchers: {
    /** An array of event types, which, when received, will cause the watcher to restart. */
    rewatchOnRawEvents: any,

    /**
     * `watchOptions` to pass directly to webpack.
     * 
     * @see [webpack@4 watch options](https://v4.webpack.js.org/configuration/watch/#watchoptions).
    */
    webpack: {
       /** @default 1000 */
       aggregateTimeout: number,
    },

    /**
     * Options to pass directly to `chokidar`.
     * 
     * @see [chokidar](https://github.com/paulmillr/chokidar#api)
    */
    chokidar: {
       /** @default true */
       ignoreInitial: boolean,
    },
  },

  /**
   * Your preferred code editor to launch when debugging.
   * 
   * @see [documentation](https://github.com/yyx990803/launch-editor#supported-editors)
   * 
   * @version 2
  */
  editor: string,

  /**
   * Hooks are listeners to Nuxt events that are typically used in modules, but are also available in `nuxt.config`.
   * Internally, hooks follow a naming pattern using colons (e.g., build:done).
   * For ease of configuration, you can also structure them as an hierarchical object in `nuxt.config` (as below).
   * 
   * @example
   * ```js
   * import fs from 'fs'
   * import path from 'path'
   * export default {
   *   hooks: {
   *     build: {
   *       done(builder) {
   *         const extraFilePath = path.join(
   *           builder.nuxt.options.buildDir,
   *           'extra-file'
   *         )
   *         fs.writeFileSync(extraFilePath, 'Something extra')
   *       }
   *     }
   *   }
   * }
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  hooks: NuxtHooks,

  /**
   * Runtime config allows passing dynamic config and environment variables to the Nuxt app context.
   * It is added to the Nuxt payload so there is no need to rebuild to update your configuration in development or if your application is served by the Nuxt server. (For static sites you will still need to regenerate your site to see changes.)
   * The value of this object is accessible from server only using `$config`.
   * It will override `publicRuntimeConfig` on the server-side.
   * It should hold _private_ environment variables (that should not be exposed on the frontend). This could include a reference to your API secret tokens.
   * 
   * @example
   * ```js
   * export default {
   *   privateRuntimeConfig: {
   *     apiSecret: process.env.API_SECRET
   *   }
   * }
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  privateRuntimeConfig: PrivateRuntimeConfig,

  /**
   * Runtime config allows passing dynamic config and environment variables to the Nuxt app context.
   * It is added to the Nuxt payload so there is no need to rebuild to update your configuration in development or if your application is served by the Nuxt server. (For static sites you will still need to regenerate your site to see changes.)
   * The value of this object is accessible from both client and server using `$config`. It should hold env variables that are _public_ as they will be accessible on the frontend. This could include a reference to your public URL.
   * 
   * @example
   * ```js
   * export default {
   *   publicRuntimeConfig: {
   *     baseURL: process.env.BASE_URL || 'https://nuxtjs.org'
   *   }
   * }
   * ```
   * 
   * @version 2
   * 
   * @version 3
  */
  publicRuntimeConfig: PublicRuntimeConfig,

  /**
   * @default 2
   * 
   * @private
  */
  _majorVersion: number,

  /**
   * @default false
   * 
   * @private
  */
  _legacyGenerate: boolean,

  /**
   * @default false
   * 
   * @private
  */
  _start: boolean,

  /**
   * @default false
   * 
   * @private
  */
  _build: boolean,

  /**
   * @default false
   * 
   * @private
  */
  _generate: boolean,

  /**
   * @default false
   * 
   * @private
  */
  _cli: boolean,

  /**
   * 
   * @private
  */
  _requiredModules: any,

  /**
   * 
   * @private
  */
  _nuxtConfigFile: any,

  /**
   * 
   * @private
  */
  _nuxtConfigFiles: Array<any>,

  /**
   * @default ""
   * 
   * @private
  */
  appDir: string,

  build: {
    /**
     * Suppresses most of the build output log.
     * It is enabled by default when a CI or test environment is detected.
     * @default false
     * 
     * @see [std-env](https://github.com/unjs/std-env)
     * 
     * @version 2
    */
    quiet: boolean,

    /**
     * Nuxt uses `webpack-bundle-analyzer` to visualize your bundles and how to optimize them.
     * Set to `true` to enable bundle analysis, or pass an object with options: [for webpack](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin) or [for vite](https://github.com/btd/rollup-plugin-visualizer#options).
     * @default false
     * 
     * @example
     * ```js
     * analyze: {
     *   analyzerMode: 'static'
     * }
     * ```
    */
    analyze: boolean | BundleAnalyzerPlugin.Options | PluginVisualizerOptions,

    /**
     * Enable the profiler in webpackbar.
     * It is normally enabled by CLI argument `--profile`.
     * @default false
     * 
     * @see [webpackbar](https://github.com/unjs/webpackbar#profile)
     * 
     * @version 2
    */
    profile: boolean,

    /**
     * Enables Common CSS Extraction using [Vue Server Renderer guidelines](https://ssr.vuejs.org/guide/css.html).
     * Using [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin/) under the hood, your CSS will be extracted into separate files, usually one per component. This allows caching your CSS and JavaScript separately and is worth trying if you have a lot of global or shared CSS.
     * @default false
     * 
     * @example
     * ```js
     * export default {
     *   build: {
     *     extractCSS: true,
     *     // or
     *     extractCSS: {
     *       ignoreOrder: true
     *     }
     *   }
     * }
     * ```
     * 
     * If you want to extract all your CSS to a single file, there is a workaround for this.
     * However, note that it is not recommended to extract everything into a single file.
     * Extracting into multiple CSS files is better for caching and preload isolation. It
     * can also improve page performance by downloading and resolving only those resources
     * that are needed.
     * 
     * @example
     * ```js
     * export default {
     *   build: {
     *     extractCSS: true,
     *     optimization: {
     *       splitChunks: {
     *         cacheGroups: {
     *           styles: {
     *             name: 'styles',
     *             test: /\.(css|vue)$/,
     *             chunks: 'all',
     *             enforce: true
     *           }
     *         }
     *       }
     *     }
     *   }
     * }
     * ```
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    extractCSS: boolean,

    /**
     * Enables CSS source map support (defaults to true in development)
     * @default false
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    cssSourceMap: boolean,

    /**
     * Creates special webpack bundle for SSR renderer. It is normally not necessary to change this value.
     * 
     * @version 2
    */
    ssr: any,

    /**
     * Enable [thread-loader](https://github.com/webpack-contrib/thread-loader#thread-loader) when building app with webpack.
     * @default false
     * 
     * @warning This is an unstable feature.
     * 
     * @version 2
    */
    parallel: boolean,

    /**
     * Enable caching for [`terser-webpack-plugin`](https://github.com/webpack-contrib/terser-webpack-plugin#options) and [`cache-loader`](https://github.com/webpack-contrib/cache-loader#cache-loader)
     * @default false
     * 
     * @warning This is an unstable feature.
     * 
     * @version 2
    */
    cache: boolean,

    /**
     * Inline server bundle dependencies
     * This mode bundles `node_modules` that are normally preserved as externals in the server build.
     * @default false
     * 
     * @warning Runtime dependencies (modules, `nuxt.config`, server middleware and the static directory) are not bundled.
     * This feature only disables use of [webpack-externals](https://webpack.js.org/configuration/externals/) for server-bundle.
     * 
     * @note You can enable standalone bundling by passing `--standalone` via the command line.
     * 
     * @see [context](https://github.com/nuxt/nuxt.js/pull/4661)
     * 
     * @version 2
    */
    standalone: boolean,

    /**
     * If you are uploading your dist files to a CDN, you can set the publicPath to your CDN.
     * @default "/_nuxt/"
     * 
     * @note This is only applied in production.
     * 
     * The value of this property at runtime will override the configuration of an app that
     * has already been built.
     * 
     * @example
     * ```js
     * build: {
     *   publicPath: process.env.PUBLIC_PATH || 'https://cdn.nuxtjs.org'
     * }
     * ```
     * 
     * @version 2
     * 
     * @version 3
    */
    publicPath: string,

    /**
     * The polyfill library to load to provide URL and URLSearchParams.
     * Defaults to `'url'` ([see package](https://www.npmjs.com/package/url)).
     * @default "url"
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    serverURLPolyfill: string,

    /**
     * Customize bundle filenames.
     * To understand a bit more about the use of manifests, take a look at [this webpack documentation](https://webpack.js.org/guides/code-splitting/).
     * 
     * @note Be careful when using non-hashed based filenames in production
     * as most browsers will cache the asset and not detect the changes on first load.
     * 
     * This example changes fancy chunk names to numerical ids:
     * 
     * @example
     * ```js
     * filenames: {
     *   chunk: ({ isDev }) => (isDev ? '[name].js' : '[id].[contenthash].js')
     * }
     * ```
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    filenames: {
       app: () => any,

       chunk: () => any,

       css: () => any,

       img: () => any,

       font: () => any,

       video: () => any,
    },

    /**
     * Customize the options of Nuxt's integrated webpack loaders.
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    loaders: {
       file: {
           /** @default false */
           esModule: boolean,
       },

       fontUrl: {
           /** @default false */
           esModule: boolean,

           /** @default 1000 */
           limit: number,
       },

       imgUrl: {
           /** @default false */
           esModule: boolean,

           /** @default 1000 */
           limit: number,
       },

       pugPlain: any,

       vue: {
           /** @default true */
           productionMode: boolean,

           transformAssetUrls: {
                /** @default "src" */
                video: string,

                /** @default "src" */
                source: string,

                /** @default "src" */
                object: string,

                /** @default "src" */
                embed: string,
           },

           compilerOptions: {
                [key: string]: any
           },
       },

       css: {
           /** @default 0 */
           importLoaders: number,

           /** @default false */
           esModule: boolean,
       },

       cssModules: {
           /** @default 0 */
           importLoaders: number,

           /** @default false */
           esModule: boolean,

           modules: {
                /** @default "[local]_[hash:base64:5]" */
                localIdentName: string,
           },
       },

       less: any,

       sass: {
           sassOptions: {
                /** @default true */
                indentedSyntax: boolean,
           },
       },

       scss: any,

       stylus: any,

       vueStyle: any,
    },

    /**
     * 
     * @deprecated  Use [style-resources-module](https://github.com/nuxt-community/style-resources-module/)
     * 
     * @version 2
    */
    styleResources: any,

    /**
     * Add webpack plugins.
     * 
     * @example
     * ```js
     * import webpack from 'webpack'
     * import { version } from './package.json'
     * // ...
     * plugins: [
     *   new webpack.DefinePlugin({
     *     'process.VERSION': version
     *   })
     * ]
     * ```
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    plugins: Array<any>,

    /**
     * Terser plugin options.
     * Set to false to disable this plugin, or pass an object of options.
     * 
     * @see [terser-webpack-plugin documentation](https://github.com/webpack-contrib/terser-webpack-plugin)
     * 
     * @note Enabling sourceMap will leave `//# sourceMappingURL` linking comment at
     * the end of each output file if webpack `config.devtool` is set to `source-map`.
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    terser: any,

    /**
     * Enables the [HardSourceWebpackPlugin](https://github.com/mzgoddard/hard-source-webpack-plugin) for improved caching.
     * @default false
     * 
     * @warning unstable
     * 
     * @version 2
    */
    hardSource: boolean,

    /**
     * Hard-replaces `typeof process`, `typeof window` and `typeof document` to tree-shake bundle.
     * @default false
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    aggressiveCodeRemoval: boolean,

    /**
     * OptimizeCSSAssets plugin options.
     * Defaults to true when `extractCSS` is enabled.
     * @default false
     * 
     * @see [optimize-css-assets-webpack-plugin documentation](https://github.com/NMFR/optimize-css-assets-webpack-plugin).
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    optimizeCSS: boolean,

    /**
     * Configure [webpack optimization](https://webpack.js.org/configuration/optimization/).
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    optimization: {
       /** @default "single" */
       runtimeChunk: string,

       /**
        * Set minimize to false to disable all minimizers. (It is disabled in development by default)
        * @default true
       */
       minimize: boolean,

       /** You can set minimizer to a customized array of plugins. */
       minimizer: any,

       splitChunks: {
           /** @default "all" */
           chunks: string,

           /** @default "/" */
           automaticNameDelimiter: string,

           cacheGroups: any,
       },
    },

    /**
     * Whether to split code for `layout`, `pages` and `commons` chunks.
     * Commons libs include `vue`, `vue-loader`, `vue-router`, `vuex`, etc.
     * 
     * @version 2
    */
    splitChunks: {
       /** @default false */
       layouts: boolean,

       /** @default true */
       pages: boolean,

       /** @default true */
       commons: boolean,
    },

    /**
     * Nuxt will automatically detect the current version of `core-js` in your project (`'auto'`), or you can specify which version you want to use (`2` or `3`).
     * @default "auto"
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    corejs: string,

    /**
     * Customize your Babel configuration.
     * See [babel-loader options](https://github.com/babel/babel-loader#options) and [babel options](https://babeljs.io/docs/en/options).
     * 
     * @note `.babelrc` is ignored by default.
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    babel: {
       /** @default false */
       configFile: boolean,

       /** @default false */
       babelrc: boolean,

       /**
        * An array of Babel plugins to load, or a function that takes webpack context and returns an array of Babel plugins.
        * For more information see [Babel plugins options](https://babeljs.io/docs/en/options#plugins) and [babel-loader options](https://github.com/babel/babel-loader#options).
       */
       plugins: Array<any>,

       /**
        * The Babel presets to be applied.
        * 
        * @note The presets configured here will be applied to both the client and the server
        * build. The target will be set by Nuxt accordingly (client/server). If you want to configure
        * the preset differently for the client or the server build, please use presets as a function.
        * 
        * @warning It is highly recommended to use the default preset instead customizing.
        * 
        * @example
        * ```js
        * export default {
        *   build: {
        *     babel: {
        *       presets({ isServer }, [ preset, options ]) {
        *         // change options directly
        *         options.targets = isServer ? '...' :  '...'
        *         options.corejs = '...'
        *         // return nothing
        *       }
        *     }
        *   }
        * }
        * ```
        * 
        * @example
        * ```js
        * export default {
        *   build: {
        *     babel: {
        *       presets({ isServer }, [preset, options]) {
        *         return [
        *           [
        *             preset,
        *             {
        *               targets: isServer ? '...' :  '...',
        *               ...options
        *             }
        *           ],
        *           [
        *             // Other presets
        *           ]
        *         ]
        *       }
        *     }
        *   }
        * }
        * ```
       */
       presets: any,

       /** @default false */
       cacheDirectory: boolean,
    },

    /**
     * If you want to transpile specific dependencies with Babel, you can add them here. Each item in transpile can be a package name, a function, a string or regex object matching the dependency's file name.
     * Tou can also use a function to conditionally transpile, the function will receive a object ({ isDev, isServer, isClient, isModern, isLegacy }).
     * 
     * @example
     * ```js
     *     transpile: [({ isLegacy }) => isLegacy && 'ky']
     * ```
     * 
     * @version 2
     * 
     * @version 3
    */
    transpile: Array<string | RegExp | Function>,

    /**
     * Customize PostCSS Loader plugins. Sames options as https://github.com/webpack-contrib/postcss-loader#options
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    postcss: {
       execute: any,

       postcssOptions: {
           config: any,

           plugins: any,
       },

       sourceMap: any,

       implementation: any,

       /** @default "" */
       order: string,
    },

    /**
     * 
     * @version 2
    */
    html: {
       /**
        * Configuration for the html-minifier plugin used to minify HTML files created during the build process (will be applied for all modes).
        * 
        * @warning If you make changes, they won't be merged with the defaults!
        * 
        * @example
        * ```js
        * export default {
        *   html: {
        *     minify: {
        *       collapseBooleanAttributes: true,
        *       decodeEntities: true,
        *       minifyCSS: true,
        *       minifyJS: true,
        *       processConditionalComments: true,
        *       removeEmptyAttributes: true,
        *       removeRedundantAttributes: true,
        *       trimCustomFragments: true,
        *       useShortDoctype: true
        *     }
        *   }
        * }
        * ```
       */
       minify: {
           /** @default true */
           collapseBooleanAttributes: boolean,

           /** @default true */
           decodeEntities: boolean,

           /** @default true */
           minifyCSS: boolean,

           /** @default true */
           minifyJS: boolean,

           /** @default true */
           processConditionalComments: boolean,

           /** @default true */
           removeEmptyAttributes: boolean,

           /** @default true */
           removeRedundantAttributes: boolean,

           /** @default true */
           trimCustomFragments: boolean,

           /** @default true */
           useShortDoctype: boolean,
       },
    },

    /**
     * Allows setting a different app template (other than `@nuxt/vue-app`)
     * 
     * @version 2
    */
    template: any,

    /**
     * You can provide your own templates which will be rendered based on Nuxt configuration. This feature is specially useful for using with modules.
     * Templates are rendered using [`lodash.template`](https://lodash.com/docs/4.17.15#template).
     * 
     * @example
     * ```js
     * templates: [
     *   {
     *     src: '~/modules/support/plugin.js', // `src` can be absolute or relative
     *     dst: 'support.js', // `dst` is relative to project `.nuxt` dir
     *     options: {
     *       // Options are provided to template as `options` key
     *       live_chat: false
     *     }
     *   }
     * ]
     * ```
     * 
     * @version 2
     * 
     * @version 3
    */
    templates: Array<any>,

    /**
     * You can provide your custom files to watch and regenerate after changes.
     * This feature is specially useful for using with modules.
     * 
     * @example
     * ```js
     *     watch: ['~/.nuxt/support.js']
     * ```
     * 
     * @version 2
    */
    watch: Array<any>,

    /**
     * See [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) for available options.
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    devMiddleware: {
       /** @default "none" */
       stats: string,
    },

    /**
     * See [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) for available options.
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    hotMiddleware: any,

    /**
     * 
     * @version 2
    */
    vendor: {
       "$meta": {
           /** @default "vendor has been deprecated since nuxt 2" */
           deprecated: string,
       },
    },

    /**
     * Set to `'none'` or `false` to disable stats printing out after a build.
     * 
     * @version 2
    */
    stats: {
       /** @default [{},{},{}] */
       excludeAssets: Array<any>,
    },

    /**
     * Set to `false` to disable the overlay provided by [FriendlyErrorsWebpackPlugin](https://github.com/nuxt/friendly-errors-webpack-plugin)
     * @default true
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    friendlyErrors: boolean,

    /**
     * Additional extensions (beyond `['vue', 'js']` to support in `pages/`, `layouts/`, `middleware/`, etc.)
     * 
     * @version 2
    */
    additionalExtensions: Array<any>,

    /**
     * Filters to hide build warnings.
     * 
     * @version 2
     * 
     * @version 3 webpack only
    */
    warningIgnoreFilters: Array<any>,

    /**
     * Set to true to scan files within symlinks in the build (such as within `pages/`).
     * @default false
     * 
     * @version 2
    */
    followSymlinks: boolean,
  },

  messages: {
    /**
     * The text that displays on the Nuxt loading indicator when `ssr: false`.
     * @default "Loading..."
    */
    loading: string,

    /**
     * The 404 text on the default Nuxt error page.
     * @default "This page could not be found"
    */
    error_404: string,

    /**
     * The text to display on the default Nuxt error page when there has been a server error.
     * @default "Server error"
    */
    server_error: string,

    /**
     * The text (linked to nuxtjs.org) that appears on the built-in Nuxt error page.
     * @default "Nuxt"
    */
    nuxtjs: string,

    /**
     * The text (linked to the home page) that appears on the built-in Nuxt error page.
     * @default "Back to the home page"
    */
    back_to_home: string,

    /**
     * The message that will display on a white screen if the built-in Nuxt error page can't be rendered.
     * @default "An error occurred in the application and your page could not be served. If you are the application owner, check your logs for details."
    */
    server_error_details: string,

    /**
     * The default error title (if there isn't a specific error message) on the built-in Nuxt error page.
     * @default "Error"
    */
    client_error: string,

    /**
     * The error message (in debug mode) on the built-in Nuxt error page.
     * @default "An error occurred while rendering the page. Check developer tools console for details."
    */
    client_error_details: string,
  },

  render: {
    /**
     * Use this option to customize the Vue SSR bundle renderer. This option is skipped if `ssr: false`.
     * Read [docs for Vue 2](https://ssr.vuejs.org/api/#renderer-options) here.
    */
    bundleRenderer: {
       shouldPrefetch: () => any,

       shouldPreload: () => any,

       /**
        * enabled by default for development
        * @default false
       */
       runInNewContext: boolean,
    },

    /** Configure the crossorigin attribute on `<link rel="stylesheet">` and `<script>` tags in generated HTML. [More information](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin). */
    crossorigin: any,

    /**
     * Adds prefetch and preload links for faster initial page load time. You probably don't want to disable this option unless you have many pages and routes.
     * @default true
    */
    resourceHints: boolean,

    /**
     * Whether to enable rendering of HTML - either dynamically (in server mode) or at generate time.
     * This option is automatically set based on global ssr value if not provided. This can be useful to dynamically enable/disable SSR on runtime after image builds (with docker for example).
    */
    ssr: any,

    /**
     * Forward server-side logs to the browser for better debugging (only available in development)
     * Set to `collapsed` to collapse the logs, or false to disable.
     * @default false
    */
    ssrLog: boolean,

    /** Configuration for HTTP2 push headers */
    http2: {
       /**
        * Set to true to enable HTTP2 push headers
        * @default false
       */
       push: boolean,

       /**
        * 
        * @deprecated
       */
       shouldPush: any,

       /**
        * You can control what links to push using this function. It receives `req`, `res`, `publicPath` and a `preloadFiles` array.
        * You can add your own assets to the array as well. Using `req` and `res` you can decide what links to push based on the request headers, for example using the cookie with application version.
        * Assets will be joined together with `,` and passed as a single `Link` header.
        * 
        * @example
        * ```js
        * pushAssets: (req, res, publicPath, preloadFiles) =>
        *   preloadFiles
        *     .filter(f => f.asType === 'script' && f.file === 'runtime.js')
        *     .map(f => `<${publicPath}${f.file}>; rel=preload; as=${f.asType}`)
        * ```
       */
       pushAssets: any,
    },

    /**
     * Configure the behavior of the `static/` directory.
     * See [serve-static docs](https://github.com/expressjs/serve-static) for possible options.
    */
    static: {
       /**
        * Whether to add the router base to your static assets.
        * @default true
        * 
        * @note some URL rewrites might not respect the prefix.
        * 
        * @example
        * Assets: favicon.ico
        * Router base: /t
        * With `prefix: true` (default): /t/favicon.ico
        * With `prefix: false`: /favicon.ico
       */
       prefix: boolean,
    },

    /**
     * Configure server compression.
     * Set to `false` to disable compression. You can also pass an object of options for [compression middleware](https://www.npmjs.com/package/compression), or use your own middleware by passing it in directly - for example, `otherComp({ myOptions: 'example' })`.
    */
    compressor: {
       /** @default 0 */
       threshold: number,
    },

    /**
     * To disable etag for pages set `etag: false`. See [etag docs](https://github.com/jshttp/etag) for possible options. You can use your own hash function by specifying etag.hash:
     * 
     * @example
     * ```js
     * import { murmurHash128 } from 'murmurhash-native'
     * 
     * export default {
     *   render: {
     *     etag: {
     *       hash: html => murmurHash128(html)
     *     }
     *   }
     * }
     * ```
     * In this example we are using `murmurhash-native`, which is faster
     * for larger HTML body sizes. Note that the weak option is ignored
     * when specifying your own hash function.
    */
    etag: {
       /** @default false */
       hash: boolean,

       /** @default false */
       weak: boolean,
    },

    /**
     * Use this to configure Content-Security-Policy to load external resources. [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).
     * Set to `true` to enable, or you can pass options to fine-tune your CSP options.
     * **Prerequisites**: These CSP settings are only effective when using Nuxt with `mode: 'server'` to serve your SSR application.
     * **Updating settings**: These settings are read by the Nuxt server directly from `nuxt.config.js`. This means changes to these settings take effect when the server is restarted. There is no need to rebuild the application to update CSP settings.
     * @default false
     * 
     * @example
     * ```js
     * export default {
     *   render: {
     *     csp: {
     *       hashAlgorithm: 'sha256',
     *       policies: {
     *         'script-src': [
     *           'https://www.google-analytics.com',
     *           'https://name.example.com'
     *         ],
     *         'report-uri': ['https://report.example.com/report-csp-violations']
     *       },
     *       addMeta: true
     *     }
     *   }
     * }
     * ```
     * 
     * The following example allows Google Analytics, LogRocket.io, and Sentry.io
     * for logging and analytic tracking.
     * 
     * Review [this blog on Sentry.io](https://blog.sentry.io/2018/09/04/how-sentry-captures-csp-violations)
     * To learn what tracking link you should use.
     * 
     * @example
     * ```js
     * // PRIMARY_HOSTS = `loc.example-website.com`
     * export default {
     *   render: {
     *     csp: {
     *       reportOnly: true,
     *       hashAlgorithm: 'sha256',
     *       policies: {
     *         'default-src': ["'self'"],
     *         'img-src': ['https:', '*.google-analytics.com'],
     *         'worker-src': ["'self'", `blob:`, PRIMARY_HOSTS, '*.logrocket.io'],
     *         'style-src': ["'self'", "'unsafe-inline'", PRIMARY_HOSTS],
     *         'script-src': [
     *           "'self'",
     *           "'unsafe-inline'",
     *           PRIMARY_HOSTS,
     *           'sentry.io',
     *           '*.sentry-cdn.com',
     *           '*.google-analytics.com',
     *           '*.logrocket.io'
     *         ],
     *         'connect-src': [PRIMARY_HOSTS, 'sentry.io', '*.google-analytics.com'],
     *         'form-action': ["'self'"],
     *         'frame-ancestors': ["'none'"],
     *         'object-src': ["'none'"],
     *         'base-uri': [PRIMARY_HOSTS],
     *         'report-uri': [
     *           `https://sentry.io/api/<project>/security/?sentry_key=<key>`
     *         ]
     *       }
     *     }
     *   }
     * }
     * ```
    */
    csp: boolean,

    /**
     * Options used for serving distribution files. Only applicable in production.
     * See [serve-static docs](https://www.npmjs.com/package/serve-static) for possible options.
    */
    dist: {
       /** @default false */
       index: boolean,

       /** @default "1y" */
       maxAge: string,
    },

    /**
     * Configure fallback behavior for [`serve-placeholder` middleware](https://github.com/nuxt/serve-placeholder).
     * Example of allowing `.js` extension for routing (for example, `/repos/nuxt.js`):
     * 
     * @example
     * ```js
     * export default {
     *   render: {
     *     fallback: {
     *       static: {
     *         // Avoid sending 404 for these extensions
     *         handlers: {
     *           '.js': false
     *         }
     *       }
     *     }
     *   }
     * }
     * ```
    */
    fallback: {
       /** For routes matching the publicPath (`/_nuxt/*`) Disable by setting to false. */
       dist: any,

       /** For all other routes (`/*`) Disable by setting to false. */
       static: {
           /** @default true */
           skipUnknown: boolean,

           handlers: {
                /** @default false */
                ".htm": boolean,

                /** @default false */
                ".html": boolean,
           },
       },
    },
  },

  router: {
    /**
     * Configure the router mode.
     * For server-side rendering it is not recommended to change it./
     * @default "history"
     * 
     * @version 2
    */
    mode: string,

    /**
     * The base URL of the app. For example, if the entire single page application is served under /app/, then base should use the value '/app/'.
     * This can be useful if you need to serve Nuxt as a different context root, from within a bigger web site.
     * @default "/"
     * 
     * @version 2
     * 
     * @version 3
    */
    base: string,

    /**
     * @default true
     * 
     * @private
    */
    _routerBaseSpecified: boolean,

    /**
     * 
     * @version 2
    */
    routes: Array<any>,

    /**
     * This allows changing the separator between route names that Nuxt uses.
     * Imagine we have the page file `pages/posts/_id.vue`. Nuxt will generate the route name programmatically, in this case `posts-id`. If you change the routeNameSplitter config to `/` the name will change to `posts/id`.
     * @default "-"
     * 
     * @version 2
    */
    routeNameSplitter: string,

    /**
     * Set the default(s) middleware for every page of the application.
     * 
     * @version 2
    */
    middleware: Array<any>,

    /**
     * Globally configure `<nuxt-link>` default active class.
     * @default "nuxt-link-active"
     * 
     * @version 2
    */
    linkActiveClass: string,

    /**
     * Globally configure `<nuxt-link>` default exact active class.
     * @default "nuxt-link-exact-active"
     * 
     * @version 2
    */
    linkExactActiveClass: string,

    /**
     * Globally configure `<nuxt-link>` default prefetch class (feature disabled by default)
     * @default false
     * 
     * @version 2
    */
    linkPrefetchedClass: boolean,

    /**
     * You can pass a function to extend the routes created by Nuxt.
     * 
     * @example
     * ```js
     * export default {
     *   router: {
     *     extendRoutes(routes, resolve) {
     *       routes.push({
     *         name: 'custom',
     *         path: '*',
     *         component: resolve(__dirname, 'pages/404.vue')
     *       })
     *     }
     *   }
     * }
     * ```
     * 
     * @version 2
    */
    extendRoutes: any,

    /**
     * The `scrollBehavior` option lets you define a custom behavior for the scroll position between the routes. This method is called every time a page is rendered. To learn more about it.
     * 
     * @deprecated router.scrollBehavior` property is deprecated in favor of using `~/app/router.scrollBehavior.js` file, learn more: https://nuxtjs.org/api/configuration-router#scrollbehavior
     * 
     * @see [vue-router `scrollBehavior` documentation](https://router.vuejs.org/guide/advanced/scroll-behavior.html)
     * 
     * @version 2
    */
    scrollBehavior: any,

    /**
     * Provide custom query string parse function. Overrides the default.
     * @default false
     * 
     * @version 2
    */
    parseQuery: boolean,

    /**
     * Provide custom query string stringify function. Overrides the default.
     * @default false
     * 
     * @version 2
    */
    stringifyQuery: boolean,

    /**
     * Controls whether the router should fall back to hash mode when the browser does not support history.pushState but mode is set to history.
     * Setting this to false essentially makes every router-link navigation a full page refresh in IE9. This is useful when the app is server-rendered and needs to work in IE9, because a hash mode URL does not work with SSR.
     * @default false
     * 
     * @version 2
    */
    fallback: boolean,

    /**
     * Configure `<nuxt-link>` to prefetch the code-splitted page when detected within the viewport. Requires [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to be supported (see [Caniuse](https://caniuse.com/intersectionobserver)).
     * @default true
     * 
     * @version 2
    */
    prefetchLinks: boolean,

    /**
     * When using nuxt generate with target: 'static', Nuxt will generate a payload.js for each page.
     * With this option enabled, Nuxt will automatically prefetch the payload of the linked page when the `<nuxt-link>` is visible in the viewport, making instant navigation.
     * @default true
     * 
     * @version 2
    */
    prefetchPayloads: boolean,

    /**
     * If this option is set to true, trailing slashes will be appended to every route. If set to false, they'll be removed.
     * 
     * @warning This option should not be set without preparation and has to
     * be tested thoroughly. When setting `trailingSlash` to something else than
     * undefined, the opposite route will stop working. Thus 301 redirects should
     * be in place and your internal linking has to be adapted correctly. If you set
     * `trailingSlash` to true, then only example.com/abc/ will work but not
     * example.com/abc. On false, it's vice-versa
     * 
     * @version 2
    */
    trailingSlash: any,
  },

  server: {
    /**
     * Whether to enable HTTPS.
     * @default false
     * 
     * @example
     * ```js
     * export default {
     *   server: {
     *     https: {
     *       key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
     *       cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
     *     }
     *   }
     * }
     * ```
     * 
     * @version 2
     * 
     * @deprecated  This option is ignored with Bridge and Nuxt 3
    */
    https: boolean,

    /**
     * @default 3000
     * 
     * @deprecated  This option is ignored with Bridge and Nuxt 3
    */
    port: number,

    /**
     * @default "localhost"
     * 
     * @deprecated  This option is ignored with Bridge and Nuxt 3
    */
    host: string,

    /**
     * 
     * @deprecated  This option is ignored with Bridge and Nuxt 3
    */
    socket: any,

    /**
     * Enabling timing adds a middleware to measure the time elapsed during server-side rendering and adds it to the headers as 'Server-Timing'.
     * Apart from true/false, this can be an object for providing options. Currently, only `total` is supported (which directly tracks the whole time spent on server-side rendering.
     * 
     * @deprecated This option is ignored with Bridge and Nuxt 3
    */
    timing: () => any,
  },

  cli: {
    /**
     * Add a message to the CLI banner by adding a string to this array.
     * 
     * @version 2
    */
    badgeMessages: string[],

    /**
     * Change the color of the 'Nuxt.js' title in the CLI banner.
     * @default "green"
     * 
     * @version 2
    */
    bannerColor: string,
  },

  generate: {
    /**
     * Directory name that holds all the assets and generated pages for a `static` build.
     * @default "/project/dist"
    */
    dir: string,

    /**
     * The routes to generate.
     * If you are using the crawler, this will be only the starting point for route generation. This is often necessary when using dynamic routes.
     * It can be an array or a function.
     * 
     * @example
     * ```js
     * routes: ['/users/1', '/users/2', '/users/3']
     * ```
     * 
     * You can pass a function that returns a promise or a function that takes a callback. It should
     * return an array of strings or objects with `route` and (optional) `payload` keys.
     * 
     * @example
     * ```js
     * export default {
     *   generate: {
     *     async routes() {
     *       const res = await axios.get('https://my-api/users')
     *       return res.data.map(user => ({ route: '/users/' + user.id, payload: user }))
     *     }
     *   }
     * }
     * ```
     * Or instead:
     * ```js
     * export default {
     *   generate: {
     *     routes(callback) {
     *       axios
     *         .get('https://my-api/users')
     *         .then(res => {
     *           const routes = res.data.map(user => '/users/' + user.id)
     *           callback(null, routes)
     *         })
     *         .catch(callback)
     *     }
     *   }
     * }
     * ```
     * 
     * If `routes()` returns a payload, it can be accessed from the Nuxt context.
     * 
     * @example
     * ```js
     * export default {
     *   async useAsyncData ({ params, error, payload }) {
     *     if (payload) return { user: payload }
     *     else return { user: await backend.fetchUser(params.id) }
     *   }
     * }
     * ```
    */
    routes: Array<any>,

    /** An array of string or regular expressions that will prevent generation of routes matching them. The routes will still be accessible when `fallback` is set. */
    exclude: Array<any>,

    /**
     * The number of routes that are generated concurrently in the same thread.
     * @default 500
    */
    concurrency: number,

    /**
     * Interval in milliseconds between two render cycles to avoid flooding a potential API with calls.
     * @default 0
    */
    interval: number,

    /**
     * Set to `false` to disable creating a directory + `index.html` for each route.
     * @default true
     * 
     * @example
     * ```bash
     * # subFolders: true
     * -| dist/
     * ---| index.html
     * ---| about/
     * -----| index.html
     * ---| products/
     * -----| item/
     * -------| index.html
     * 
     * # subFolders: false
     * -| dist/
     * ---| index.html
     * ---| about.html
     * ---| products/
     * -----| item.html
     * ```
    */
    subFolders: boolean,

    /**
     * The path to the fallback HTML file.
     * Set this as the error page in your static server configuration, so that unknown routes can be rendered (on the client-side) by Nuxt.
     * * If unset or set to a falsy value, the name of the fallback HTML file will be `200.html`. * If set to true, the filename will be `404.html`. * If you provide a string as a value, it will be used instead.
     * @default "200.html"
     * 
     * @note Multiple services (e.g. Netlify) detect a `404.html` automatically. If
     * you configure your web server on your own, please consult its documentation
     * to find out how to set up an error page (and set it to the 404.html file)
    */
    fallback: string,

    /**
     * Set to `false` to disable generating pages discovered through crawling relative links in generated pages.
     * @default true
    */
    crawler: boolean,

    /**
     * Set to `false` to disable generating a `manifest.js` with a list of all generated pages.
     * @default true
    */
    manifest: boolean,

    /**
     * Set to `false` to disable generating a `.nojekyll` file (which aids compatibility with GitHub Pages).
     * @default true
    */
    nojekyll: boolean,

    /**
     * Configure the cache (used with `static` target to avoid rebuilding when no files have changed).
     * Set to `false` to disable completely.
    */
    cache: {
       /** An array of files or directories to ignore. (It can also be a function that returns an array.) */
       ignore: Array<any>,

       /** Options to pass to [`globby`](https://github.com/sindresorhus/globby), which is used to generate a 'snapshot' of the source files. */
       globbyOptions: {
           /** @default true */
           gitignore: boolean,
       },
    },

    staticAssets: {
       /**
        * The directory underneath `/_nuxt/`, where static assets (payload, state and manifest files) will live.
        * @default "static"
       */
       dir: string,

       /**
        * The full path to the directory underneath `/_nuxt/` where static assets (payload, state and manifest files) will live.
        * @default "/project/dist"
       */
       base: string,

       /**
        * The full path to the versioned directory where static assets for the current buidl are located.
        * @default ""
       */
       versionBase: string,

       /**
        * A unique string to uniquely identify payload versions (defaults to the current timestamp).
        * @default "1637506587"
       */
       version: string,
    },
  },

  typescript: {
    /**
     * TypeScript comes with certain checks to give you more safety and analysis of your program. Once you’ve converted your codebase to TypeScript, you can start enabling these checks for greater safety. [Read More](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html#getting-stricter-checks)
     * @default false
    */
    strict: boolean,

    /** You can extend generated `.nuxt/tsconfig.json` using this option */
    tsConfig: any,
  },

  /**
   * Configuration that will be passed directly to Vite.
   * See https://vitejs.dev/config for more information. Please note that not all vite options are supported in Nuxt.
   * 
   * @version 3
  */
  vite: boolean | InlineConfig,
}