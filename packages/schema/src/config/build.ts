import defu from 'defu'
import { join } from 'pathe'
import { isCI, isTest } from 'std-env'
import { normalizeURL, withTrailingSlash } from 'ufo'

export default {
  /**
   * The builder to use for bundling the Vue part of your application.
   *
   * @type {'vite' | 'webpack' | { bundle: (nuxt: typeof import('../src/types/nuxt').Nuxt) => Promise<void> }}
   * @version 3
   */
  builder: {
    $resolve: (val, get) => {
      if (typeof val === 'object') {
        return val
      }
      const map = {
        vite: '@nuxt/vite-builder',
        webpack: '@nuxt/webpack-builder',
      }
      return map[val] || (get('vite') === false ? map.webpack : map.vite)
    },
  },
  /**
   * Shared build configuration.
   * @version 2
   * @version 3
   */
  build: {
    /**
     * Suppresses most of the build output log.
     *
     * It is enabled by default when a CI or test environment is detected.
     *
     * @see [std-env](https://github.com/unjs/std-env)
     * @version 2
     * @version 3
     */
    quiet: Boolean(isCI || isTest),

    /**
     * Nuxt uses `webpack-bundle-analyzer` to visualize your bundles and how to optimize them.
     *
     * Set to `true` to enable bundle analysis, or pass an object with options: [for webpack](https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin) or [for vite](https://github.com/btd/rollup-plugin-visualizer#options).
     *
     * @example
     * ```js
     * analyze: {
     *   analyzerMode: 'static'
     * }
     * ```
     * @type {boolean | typeof import('webpack-bundle-analyzer').BundleAnalyzerPlugin.Options | typeof import('rollup-plugin-visualizer').PluginVisualizerOptions}
     */
    analyze: {
      $resolve: (val, get) => {
        if(val !== true) {
          return val ?? false
        }
        const rootDir = get('rootDir')
        return {
          template: 'treemap',
          projectRoot: rootDir,
          filename: join(rootDir, '.nuxt/stats', '{name}.html')
        }
      }
    },

    /**
     * Enable the profiler in webpackbar.
     *
     * It is normally enabled by CLI argument `--profile`.
     *
     * @see [webpackbar](https://github.com/unjs/webpackbar#profile)
     * @version 2
     */
    profile: process.argv.includes('--profile'),

    /**
     * Enables Common CSS Extraction using
     * [Vue Server Renderer guidelines](https://ssr.vuejs.org/guide/css.html).
     *
     * Using [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin/) under the hood, your CSS will be extracted
     * into separate files, usually one per component. This allows caching your CSS and
     * JavaScript separately and is worth trying if you have a lot of global or shared CSS.
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
     * @version 2
     */
    extractCSS: false,

    /**
     * Enables CSS source map support (defaults to true in development)
     * @version 2
     */
    cssSourceMap: {
      $resolve: (val, get) => val ?? get('dev')
    },

    /**
     * Creates special webpack bundle for SSR renderer. It is normally not necessary to change this value.
     * @version 2
     */
    ssr: undefined,

    /**
     * Enable [thread-loader](https://github.com/webpack-contrib/thread-loader#thread-loader) when building app with webpack.
     *
     * @warning This is an unstable feature.
     * @version 2
     */
    parallel: {
      $resolve: (val, get) => get('build.extractCSS') ? false : Boolean(val)
    },

    /**
     * Enable caching for [`terser-webpack-plugin`](https://github.com/webpack-contrib/terser-webpack-plugin#options)
     * and [`cache-loader`](https://github.com/webpack-contrib/cache-loader#cache-loader)
     *
     * @warning This is an unstable feature.
     * @version 2
     */
    cache: false,

    /**
     * Inline server bundle dependencies
     *
     * This mode bundles `node_modules` that are normally preserved as externals in the server build.
     *
     * @warning Runtime dependencies (modules, `nuxt.config`, server middleware and the static directory) are not bundled.
     * This feature only disables use of [webpack-externals](https://webpack.js.org/configuration/externals/) for server-bundle.
     *
     * @note You can enable standalone bundling by passing `--standalone` via the command line.
     *
     * @see [context](https://github.com/nuxt/nuxt.js/pull/4661)
     * @version 2
     */
    standalone: false,

    /**
     * If you are uploading your dist files to a CDN, you can set the publicPath to your CDN.
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
     * @version 2
     */
    publicPath: {
      $resolve: (val, get) => val ? withTrailingSlash(normalizeURL(val)) : get('app').buildAssetsDir
    },

    /**
     * The polyfill library to load to provide URL and URLSearchParams.
     *
     * Defaults to `'url'` ([see package](https://www.npmjs.com/package/url)).
     * @version 2
     */
    serverURLPolyfill: 'url',

    /**
     * Customize bundle filenames.
     *
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
     * @version 2
     */
    filenames: {
      app: ({ isDev, isModern }) => isDev ? `[name]${isModern ? '.modern' : ''}.js` : `[contenthash:7]${isModern ? '.modern' : ''}.js`,
      chunk: ({ isDev, isModern }) => isDev ? `[name]${isModern ? '.modern' : ''}.js` : `[contenthash:7]${isModern ? '.modern' : ''}.js`,
      css: ({ isDev }) => isDev ? '[name].css' : 'css/[contenthash:7].css',
      img: ({ isDev }) => isDev ? '[path][name].[ext]' : 'img/[name].[contenthash:7].[ext]',
      font: ({ isDev }) => isDev ? '[path][name].[ext]' : 'fonts/[name].[contenthash:7].[ext]',
      video: ({ isDev }) => isDev ? '[path][name].[ext]' : 'videos/[name].[contenthash:7].[ext]'
    },

    /**
     * Customize the options of Nuxt's integrated webpack loaders.
     * @version 2
     */
    loaders: {
      $resolve: (val, get) => {
        const styleLoaders = [
          'css', 'cssModules', 'less',
          'sass', 'scss', 'stylus', 'vueStyle'
        ]
        for (const name of styleLoaders) {
          const loader = val[name]
          if (loader && loader.sourceMap === undefined) {
            loader.sourceMap = Boolean(get('build.cssSourceMap'))
          }
        }
        return val
      },
      file: { esModule: false },
      fontUrl: { esModule: false, limit: 1000 },
      imgUrl: { esModule: false, limit: 1000 },
      pugPlain: {},
      vue: {
        productionMode: { $resolve: (val, get) => val ?? !get('dev') },
        transformAssetUrls: {
          video: 'src',
          source: 'src',
          object: 'src',
          embed: 'src'
        },
        compilerOptions: { $resolve: (val, get) => val ?? get('vue.compilerOptions') },
      },
      css: {
        importLoaders: 0,
        esModule: false
      },
      cssModules: {
        importLoaders: 0,
        esModule: false,
        modules: {
          localIdentName: '[local]_[hash:base64:5]'
        }
      },
      less: {},
      sass: {
        sassOptions: {
          indentedSyntax: true
        }
      },
      scss: {},
      stylus: {},
      vueStyle: {}
    },

    /**
     * @deprecated  Use [style-resources-module](https://github.com/nuxt-community/style-resources-module/)
     * @version 2
     */
    styleResources: {},

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
     * @version 2
     */
    plugins: [],

    /**
     * Terser plugin options.
     *
     * Set to false to disable this plugin, or pass an object of options.
     *
     * @see [terser-webpack-plugin documentation](https://github.com/webpack-contrib/terser-webpack-plugin)
     *
     * @note Enabling sourceMap will leave `//# sourceMappingURL` linking comment at
     * the end of each output file if webpack `config.devtool` is set to `source-map`.
     * @version 2
     */
    terser: {},

    /**
     * Enables the [HardSourceWebpackPlugin](https://github.com/mzgoddard/hard-source-webpack-plugin) for improved caching.
     *
     * @warning unstable
     * @version 2
     */
    hardSource: false,

    /**
     * Hard-replaces `typeof process`, `typeof window` and `typeof document` to tree-shake bundle.
     * @version 2
     */
    aggressiveCodeRemoval: false,

    /**
     * OptimizeCSSAssets plugin options.
     *
     * Defaults to true when `extractCSS` is enabled.
     *
     * @see [optimize-css-assets-webpack-plugin documentation](https://github.com/NMFR/optimize-css-assets-webpack-plugin).
     * @version 2
     */
    optimizeCSS: {
      $resolve: (val, get) => val ?? (get('build.extractCSS') ? {} : false)
    },

    /**
     * Configure [webpack optimization](https://webpack.js.org/configuration/optimization/).
     * @version 2
     */
    optimization: {
      runtimeChunk: 'single',
      /** Set minimize to false to disable all minimizers. (It is disabled in development by default) */
      minimize: { $resolve: (val, get) => val ?? !get('dev') },
      /** You can set minimizer to a customized array of plugins. */
      minimizer: undefined,
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '/',
        cacheGroups: {}
      }
    },

    /**
     * Whether to split code for `layout`, `pages` and `commons` chunks.
     *
     * Commons libs include `vue`, `vue-loader`, `vue-router`, `vuex`, etc.
     * @version 2
     */
    splitChunks: {
      layouts: false,
      pages: true,
      commons: true
    },

    /**
     * Nuxt will automatically detect the current version of `core-js` in your project (`'auto'`),
     * or you can specify which version you want to use (`2` or `3`).
     * @version 2
     */
    corejs: 'auto',

    /**
     * Customize your Babel configuration.
     *
     * See [babel-loader options](https://github.com/babel/babel-loader#options) and
     * [babel options](https://babeljs.io/docs/en/options).
     *
     * @note `.babelrc` is ignored by default.
     * @version 2
     */
    babel: {
      configFile: false,
      babelrc: false,
      /**
       * An array of Babel plugins to load, or a function that takes webpack context and returns
       * an array of Babel plugins.
       *
       * For more information see [Babel plugins options](https://babeljs.io/docs/en/options#plugins)
       * and [babel-loader options](https://github.com/babel/babel-loader#options).
       */
      plugins: [],
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
      presets: {},
      cacheDirectory: {
        $resolve: (val, get) => val ?? get('dev')
      }
    },

    /**
     * If you want to transpile specific dependencies with Babel, you can add them here.
     * Each item in transpile can be a package name, a function, a string or regex object matching the
     * dependency's file name.
     *
     * You can also use a function to conditionally transpile. The function will receive an object ({ isDev, isServer, isClient, isModern, isLegacy }).
     *
     * @example
     * ```js
      transpile: [({ isLegacy }) => isLegacy && 'ky']
     * ```
     * @version 2
     * @version 3
     * @type {Array<string | RegExp | Function>}
     */
    transpile: {
      $resolve: val => [].concat(val).filter(Boolean)
    },

    /**
     * Customize PostCSS Loader plugins.
     * Sames options as https://github.com/webpack-contrib/postcss-loader#options
     * @version 2
     */
    postcss: {
      execute: undefined,
      postcssOptions: {
        $resolve: (val, get) => {
          // Ensure we return the same object in `build.postcss.postcssOptions as `postcss`
          // so modules which modify the configuration continue to work.
          const postcssOptions = get('postcss')
          Object.assign(postcssOptions, defu(postcssOptions, val))
          return postcssOptions
        }
      },
      sourceMap: undefined,
      implementation: undefined,
      order: ''
    },

    /** @version 2 */
    html: {
      /**
       * Configuration for the html-minifier plugin used to minify HTML files created
       * during the build process (will be applied for all modes).
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
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        processConditionalComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        trimCustomFragments: true,
        useShortDoctype: true
      }
    },

    /**
     * Allows setting a different app template (other than `@nuxt/vue-app`)
     * @version 2
     */
    template: undefined,
    /**
     * You can provide your own templates which will be rendered based
     * on Nuxt configuration. This feature is specially useful for using with modules.
     *
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
     * @version 2
     * @version 3
     */
    templates: [],

    /**
     * You can provide your custom files to watch and regenerate after changes.
     *
     * This feature is especially useful for using with modules.
     *
     * @example
     * ```js
      watch: ['~/.nuxt/support.js']
     * ```
     * @version 2
     */
    watch: [],
    /**
     * See [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) for available options.
     * @version 2
     */
    devMiddleware: {
      stats: 'none'
    },
    /**
     * See [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) for available options.
     * @version 2
     */
    hotMiddleware: {},

    /** @version 2 */
    vendor: {
      $meta: {
        deprecated: 'vendor has been deprecated since nuxt 2'
      }
    },

    /**
     * Set to `'none'` or `false` to disable stats printing out after a build.
     * @version 2
     */
    stats: {
      $resolve: (val, get) => (val === 'none' || get('build.quiet')) ? false : val,
      excludeAssets: [
        /.map$/,
        /index\..+\.html$/,
        /vue-ssr-(client|modern)-manifest.json/
      ]
    },
    /**
     * Set to `false` to disable the overlay provided by [FriendlyErrorsWebpackPlugin](https://github.com/nuxt/friendly-errors-webpack-plugin)
     * @version 2
     */
    friendlyErrors: true,
    /**
     * Additional extensions (beyond `['vue', 'js']` to support in `pages/`, `layouts/`, `middleware/`, etc.)
     * @version 2
     */
    additionalExtensions: [],
    /**
     * Filters to hide build warnings.
     * @version 2
     */
    warningIgnoreFilters: [],

    /**
     * Set to true to scan files within symlinks in the build (such as within `pages/`).
     * @version 2
     */
    followSymlinks: false
  }
}
