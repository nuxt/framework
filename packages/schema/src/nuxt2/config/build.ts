import { defineUntypedSchema } from 'untyped'
import defu from 'defu'
import { join } from 'pathe'
import { isCI, isTest } from 'std-env'
import { normalizeURL, withTrailingSlash } from 'ufo'

/**
 * Shared build configuration.
 */
export default defineUntypedSchema({
  build: {
    /**
    * Suppresses most of the build output log.
    *
    * It is enabled by default when a CI or test environment is detected.
    *
    * @see [std-env](https://github.com/unjs/std-env)
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
     *
     */
    analyze: {
      $resolve: async (val, get) => {
        if (val !== true) {
          return val ?? false
        }
        const rootDir = await get('rootDir')
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
     */
    extractCSS: false,

    /**
     * Enables CSS source map support (defaults to true in development)
     */
    cssSourceMap: {
      $resolve: async (val, get) => val ?? (await get('sourcemap.client') || await get('sourcemap.server')) ?? await get('dev')
    },

    /**
     * Creates special webpack bundle for SSR renderer. It is normally not necessary to change this value.
     */
    ssr: undefined,

    /**
     * Enable [thread-loader](https://github.com/webpack-contrib/thread-loader#thread-loader) when building app with webpack.
     *
     * @warning This is an unstable feature.
     */
    parallel: {
      $resolve: async (val, get) => await get('build.extractCSS') ? false : Boolean(val)
    },

    /**
     * Enable caching for [`terser-webpack-plugin`](https://github.com/webpack-contrib/terser-webpack-plugin#options)
     * and [`cache-loader`](https://github.com/webpack-contrib/cache-loader#cache-loader).
     *
     * @warning This is an unstable feature.
     */
    cache: false,

    /**
     * Inline server bundle dependencies.
     *
     * This mode bundles `node_modules` that are normally preserved as externals in the server build.
     *
     * @warning Runtime dependencies (modules, `nuxt.config`, server middleware and the static directory) are not bundled.
     * This feature only disables use of [webpack-externals](https://webpack.js.org/configuration/externals/) for server-bundle.
     *
     * @note You can enable standalone bundling by passing `--standalone` via the command line.
     *
     * @see [context](https://github.com/nuxt/nuxt.js/pull/4661)
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
     */
    publicPath: {
      $resolve: async (val, get) => val ? withTrailingSlash(normalizeURL(val)) : (await get('app').buildAssetsDir)
    },

    /**
     * The polyfill library to load to provide URL and URLSearchParams.
     *
     * Defaults to `'url'` ([see package](https://www.npmjs.com/package/url)).
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
     * @type {Record<string, ((arg: any) => string)>}
     */
    filenames: {
      app: ({ isDev, isModern }: any) => isDev ? `[name]${isModern ? '.modern' : ''}.js` : `[contenthash:7]${isModern ? '.modern' : ''}.js`,
      chunk: ({ isDev, isModern }: any) => isDev ? `[name]${isModern ? '.modern' : ''}.js` : `[contenthash:7]${isModern ? '.modern' : ''}.js`,
      css: ({ isDev }: any) => isDev ? '[name].css' : 'css/[contenthash:7].css',
      img: ({ isDev }: any) => isDev ? '[path][name].[ext]' : 'img/[name].[contenthash:7].[ext]',
      font: ({ isDev }: any) => isDev ? '[path][name].[ext]' : 'fonts/[name].[contenthash:7].[ext]',
      video: ({ isDev }: any) => isDev ? '[path][name].[ext]' : 'videos/[name].[contenthash:7].[ext]'
    },

    /**
     * Customize the options of Nuxt's integrated webpack loaders.
     */
    loaders: {
      $resolve: async (val, get) => {
        const styleLoaders = [
          'css', 'cssModules', 'less',
          'sass', 'scss', 'stylus', 'vueStyle'
        ]
        for (const name of styleLoaders) {
          const loader = val[name]
          if (loader && loader.sourcemap === undefined) {
            loader.sourcemap = Boolean(await get('build.cssSourceMap'))
          }
        }
        return val
      },
      file: { esModule: false },
      fontUrl: { esModule: false, limit: 1000 },
      imgUrl: { esModule: false, limit: 1000 },
      pugPlain: {},
      vue: {
        productionMode: { $resolve: async (val, get) => val ?? !(await get('dev')) },
        transformAssetUrls: {
          video: 'src',
          source: 'src',
          object: 'src',
          embed: 'src'
        },
        compilerOptions: { $resolve: async (val, get) => val ?? await get('vue.compilerOptions') },
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
     */
    plugins: [],

    /**
     * Terser plugin options.
     *
     * Set to false to disable this plugin, or pass an object of options.
     *
     * @see [terser-webpack-plugin documentation](https://github.com/webpack-contrib/terser-webpack-plugin)
     *
     * @note Enabling sourcemap will leave `//# sourcemappingURL` linking comment at
     * the end of each output file if webpack `config.devtool` is set to `source-map`.
     */
    terser: {},

    /**
     * Enables the [HardSourceWebpackPlugin](https://github.com/mzgoddard/hard-source-webpack-plugin) for improved caching.
     *
     * @warning unstable
     */
    hardSource: false,

    /**
     * Hard-replaces `typeof process`, `typeof window` and `typeof document` to tree-shake bundle.
     */
    aggressiveCodeRemoval: false,

    /**
     * OptimizeCSSAssets plugin options.
     *
     * Defaults to true when `extractCSS` is enabled.
     *
     * @see [optimize-css-assets-webpack-plugin documentation](https://github.com/NMFR/optimize-css-assets-webpack-plugin).
     */
    optimizeCSS: {
      $resolve: async (val, get) => val ?? (await get('build.extractCSS') ? {} : false)
    },

    /**
     * Configure [webpack optimization](https://webpack.js.org/configuration/optimization/).
     */
    optimization: {
      runtimeChunk: 'single',
      /** Set minimize to false to disable all minimizers. (It is disabled in development by default) */
      minimize: {
        $resolve: async (val, get) => val ?? !(await get('dev'))
      },
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
     */
    splitChunks: {
      layouts: false,
      pages: true,
      commons: true
    },

    /**
     * Nuxt will automatically detect the current version of `core-js` in your project (`'auto'`),
     * or you can specify which version you want to use (`2` or `3`).
     */
    corejs: 'auto',

    /**
     * Customize your Babel configuration.
     *
     * See [babel-loader options](https://github.com/babel/babel-loader#options) and
     * [babel options](https://babeljs.io/docs/en/options).
     *
     * @note `.babelrc` is ignored by default.
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
        $resolve: async (val, get) => val ?? (await get('dev'))
      }
    },

    /**
     * Customize PostCSS Loader plugins.
     * Sames options as https://github.com/webpack-contrib/postcss-loader#options
     */
    postcss: {
      execute: undefined,
      postcssOptions: {
        $resolve: async (val, get) => {
          // Ensure we return the same object in `build.postcss.postcssOptions as `postcss`
          // so modules which modify the configuration continue to work.
          const postcssOptions = await get('postcss')
          Object.assign(postcssOptions, defu(postcssOptions, val))
          return postcssOptions
        }
      },
      sourcemap: undefined,
      implementation: undefined,
      order: ''
    },

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
     */
    template: undefined,

    /**
     * You can provide your custom files to watch and regenerate after changes.
     *
     * This feature is especially useful for using with modules.
     *
     * @example
     * ```js
      watch: ['~/.nuxt/support.js']
     * ```
     */
    watch: [],

    /**
     * See [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) for available options.
     */
    devMiddleware: {
      stats: 'none'
    },

    /**
     * See [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) for available options.
     */
    hotMiddleware: {},

    vendor: {
      $meta: {
        deprecated: 'vendor has been deprecated since nuxt 2'
      }
    },

    /**
     * Set to `'none'` or `false` to disable stats printing out after a build.
     */
    stats: {
      $resolve: async (val, get) => (val === 'none' || (await get('build.quiet'))) ? false : val,
      excludeAssets: [
        /.map$/,
        /index\..+\.html$/,
        /vue-ssr-(client|modern)-manifest.json/
      ]
    },

    /**
     * Set to `false` to disable the overlay provided by [FriendlyErrorsWebpackPlugin](https://github.com/nuxt/friendly-errors-webpack-plugin).
     */
    friendlyErrors: true,

    /**
     * Additional extensions (beyond `['vue', 'js']` to support in `pages/`, `layouts/`, `middleware/`, etc.)
     */
    additionalExtensions: [],

    /**
     * Filters to hide build warnings.
     */
    warningIgnoreFilters: [],

    /**
     * Set to true to scan files within symlinks in the build (such as within `pages/`).
     */
    followSymlinks: false
  }
})
