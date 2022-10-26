import { defineUntypedSchema } from 'untyped'
import createRequire from 'create-require'
import { resolve } from 'pathe'
import { pascalCase } from 'scule'
import jiti from 'jiti'

export default defineUntypedSchema({
  /**
   * Your preferred code editor to launch when debugging.
   *
   * @see [documentation](https://github.com/yyx990803/launch-editor#supported-editors)
   * @type {string}
   */
  editor: undefined,

  /**
   * The watch property lets you watch custom files for restarting the server.
   *
   * `chokidar` is used to set up the watchers. To learn more about its pattern
   * options, see chokidar documentation.
   *
   * @see [chokidar](https://github.com/paulmillr/chokidar#api)
   *
   * @example
   * ```js
   * watch: ['~/custom/*.js']
   * ```
   * @type {string[]}
   */
  watch: {
    $resolve: async (val, get) => {
      const rootDir = await get('rootDir')
      return Array.from(new Set([].concat(val, await get('_nuxtConfigFiles'))
        .filter(Boolean).map(p => resolve(rootDir, p))
      ))
    }
  },

  /**
  * The style extensions that should be resolved by the Nuxt resolver (for example, in `css` property).
  */
  styleExtensions: ['.css', '.pcss', '.postcss', '.styl', '.stylus', '.scss', '.sass', '.less'],

  dir: {
    /**
     * The assets directory (aliased as `~assets` in your build).
     */
    assets: 'assets',

    /**
     * The directory containing app template files like `app.html` and `router.scrollBehavior.js`
     */
    app: 'app',

    /**
     * Allows customizing the global ID used in the main HTML template as well as the main
     * Vue instance name and other options.
     */
    globalName: {
      $resolve: val => (typeof val === 'string' && /^[a-zA-Z]+$/.test(val)) ? val.toLocaleLowerCase() : 'nuxt'
    },

    /**
   * Whether to produce a separate modern build targeting browsers that support ES modules.
   *
   * Set to `'server'` to enable server mode, where the Nuxt server checks
   * browser version based on the user agent and serves the correct bundle.
   *
   * Set to `'client'` to serve both the modern bundle with `<script type="module">`
   * and the legacy bundle with `<script nomodule>`. It will also provide a
   * `<link rel="modulepreload">` for the modern bundle. Every browser that understands
   * the module type will load the modern bundle while older browsers fall back to the
   * legacy (transpiled) bundle.
   *
   * If you have set `modern: true` and are generating your app or have `ssr: false`,
   * modern will be set to `'client'`.
   *
   * If you have set `modern: true` and are serving your app, modern will be set to `'server'`.
   *
   * @see [concept of modern mode](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)
   * @type {'server' | 'client' | boolean}
   */
    modern: undefined,

    /**
    * @deprecated use `ssr` option
    */
    mode: {
      $resolve: async (val, get) => val || ((await get('ssr')) ? 'spa' : 'universal'),
      $schema: { deprecated: '`mode` option is deprecated' }
    },

    /**
     * The `env` property defines environment variables that should be available
     * throughout your app (server- and client-side). They can be assigned using
     * server-side environment variables.
     *
     * @note Nuxt uses webpack's `definePlugin` to define these environment variables.
     * This means that the actual `process` or `process.env` from Node.js is neither
     * available nor defined. Each of the `env` properties defined here is individually
     * mapped to `process.env.xxxx` and converted during compilation.
     *
     * @note Environment variables starting with `NUXT_ENV_` are automatically injected
     * into the process environment.
     *
     */
    env: {
      $default: {},
      $resolve: (val) => {
        val = { ...val }
        for (const key in process.env) {
          if (key.startsWith('NUXT_ENV_')) {
            val[key] = process.env[key]
          }
        }
        return val
      }
    },

    /**
     * Set the method Nuxt uses to require modules, such as loading `nuxt.config`, server
     * middleware, and so on - defaulting to `jiti` (which has support for TypeScript and ESM syntax).
     *
     * @see [jiti](https://github.com/unjs/jiti)
     * @type {'jiti' | 'native' | ((p: string | { filename: string }) => NodeRequire)}
     */
    createRequire: {
      $resolve: (val: any) => {
        val = process.env.NUXT_CREATE_REQUIRE || val ||
          // @ts-expect-error global type
          (typeof globalThis.jest !== 'undefined' ? 'native' : 'jiti')
        if (val === 'jiti') {
          return (p: string | { filename: string }) => jiti(typeof p === 'string' ? p : p.filename, { esmResolve: true })
        }
        if (val === 'native') {
          return (p: string | { filename: string }) => createRequire(typeof p === 'string' ? p : p.filename)
        }
        return val
      }
    },


    /**
     * Whether your Nuxt app should be built to be served by the Nuxt server (`server`)
     * or as static HTML files suitable for a CDN or other static file server (`static`).
     *
     * This is unrelated to `ssr`.
     * @type {'server' | 'static'}
     */
    target: {
      $resolve: val => ['server', 'static'].includes(val) ? val : 'server'
    },

    /**
     * Customizes specific global names (they are based on `globalName` by default).
     */
    globals: {
      /** @type {(globalName: string) => string} */
      id: (globalName: string) => `__${globalName}`,
      /** @type {(globalName: string) => string} */
      nuxt: (globalName: string) => `$${globalName}`,
      /** @type {(globalName: string) => string} */
      context: (globalName: string) => `__${globalName.toUpperCase()}__`,
      /** @type {(globalName: string) => string} */
      pluginPrefix: (globalName: string) => globalName,
      /** @type {(globalName: string) => string} */
      readyCallback: (globalName: string) => `on${pascalCase(globalName)}Ready`,
      /** @type {(globalName: string) => string} */
      loadedCallback: (globalName: string) => `_on${pascalCase(globalName)}Loaded`
    },


    /**
     * The folder which will be used to auto-generate your Vuex store structure.
     */
    store: 'store'
  },

  /**
  * Server middleware are connect/express/h3-shaped functions that handle server-side requests. They
  * run on the server and before the Vue renderer.
  *
  * By adding entries to `serverMiddleware` you can register additional routes without the need
  * for an external server.
  *
  * You can pass a string, which can be the name of a node dependency or a path to a file. You
  * can also pass an object with `path` and `handler` keys (`handler` can be a path or a
  * function).
  *
  * @note If you pass a function directly, it will only run in development mode.
  *
  * @example
  * ```js
  * serverMiddleware: [
  *   // Will register redirect-ssl npm package
  *   'redirect-ssl',
  *   // Will register file from project server-middleware directory to handle /server-middleware/* requires
  *   { path: '/server-middleware', handler: '~/server-middleware/index.js' },
  *   // We can create custom instances too, but only in development mode, they are ignored for the production bundle.
  *   { path: '/static2', handler: serveStatic(fileURLToPath(new URL('./static2', import.meta.url))) }
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
  * @example
  * ```js
  * import bodyParser from 'body-parser'
  * import createApp from 'express'
  * const app = createApp()
  * app.use(bodyParser.json())
  * app.all('/getJSON', (req, res) => {
  *   res.json({ data: 'data' })
  * })
  * export default app
  * ```
  *
  * Alternatively, instead of passing an array of `serverMiddleware`, you can pass an object
  * whose keys are the paths and whose values are the handlers (string or function).
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
  */
  serverMiddleware: {
    $resolve: (val: any) => {
      if (!val) {
        return []
      }
      if (!Array.isArray(val)) {
        return Object.entries(val).map(([path, handler]) => ({ path, handler }))
      }
      return val
    }
  },
})
