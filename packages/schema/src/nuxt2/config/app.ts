import { defineUntypedSchema } from 'untyped'
import { resolve, join } from 'pathe'
import { existsSync, readdirSync } from 'node:fs'
import defu from 'defu'

export default defineUntypedSchema({
  vue: {
    /**
     * Properties that will be set directly on `Vue.config` for vue@2.
     *
     * @see [vue@2 Documentation](https://v2.vuejs.org/v2/api/#Global-Config)
     * @type {typeof import('vue/types/vue').VueConfiguration}
     */
    config: {
      silent: {
        $resolve: async (val, get) => val ?? !(await get('dev'))
      },
      performance: {
        $resolve: async (val, get) => val ?? await get('dev')
      },
    },
  },

  app: {
    /**
     * The folder name for the built site assets, relative to `baseURL` (or `cdnURL` if set).
     * @deprecated - use `buildAssetsDir` instead
    */
    assetsPath: {
      $resolve: async (val, get) => val ?? (await get('buildAssetsDir'))
    },
  },

  /**
   * The path to an HTML template file for rendering Nuxt responses.
   * Uses `<srcDir>/app.html` if it exists, or the Nuxt's default template if not.
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
   */
  appTemplatePath: {
    $resolve: async (val, get) => {
      if (val) {
        return resolve(await get('srcDir'), val)
      }
      if (existsSync(join(await get('srcDir'), 'app.html'))) {
        return join(await get('srcDir'), 'app.html')
      }
      return resolve(await get('buildDir'), 'views/app.template.html')
    }
  },

  /**
   * Enable or disable Vuex store.
   *
   * By default, it is enabled if there is a `store/` directory.
   */
  store: {
    $resolve: async (val, get) => val !== false &&
      existsSync(join(await get('srcDir'), await get('dir.store'))) &&
      readdirSync(join(await get('srcDir'), await get('dir.store')))
        .find(filename => filename !== 'README.md' && filename[0] !== '.')
  },

  /**
   * Options to pass directly to `vue-meta`.
   *
   * @see [documentation](https://vue-meta.nuxtjs.org/api/#plugin-options).
   * @type {typeof import('vue-meta').VueMetaOptions}
   */
  vueMeta: null,

  /**
   * Set default configuration for `<head>` on every page.
   *
   * @see [documentation](https://vue-meta.nuxtjs.org/api/#metainfo-properties) for specifics.
   * @type {typeof import('vue-meta').MetaInfo}
   */
  head: {
    /** Each item in the array maps to a newly-created `<meta>` element, where object properties map to attributes. */
    meta: [],
    /** Each item in the array maps to a newly-created `<link>` element, where object properties map to attributes. */
    link: [],
    /** Each item in the array maps to a newly-created `<style>` element, where object properties map to attributes. */
    style: [],
    /** Each item in the array maps to a newly-created `<script>` element, where object properties map to attributes. */
    script: []
  },

  /**
   * @type {typeof import('../src/types/meta').AppHeadMetaObject}
   * @deprecated - use `head` instead
   */
  meta: {
    meta: [],
    link: [],
    style: [],
    script: []
  },

  /**
   * Configuration for the Nuxt `fetch()` hook.
   */
  fetch: {
    /** Whether to enable `fetch()` on the server. */
    server: true,
    /** Whether to enable `fetch()` on the client. */
    client: true
  },

  /**
   * You may want to extend plugins or change their order. For this, you can pass
   * a function using `extendPlugins`. It accepts an array of plugin objects and
   * should return an array of plugin objects.
   * @type {(plugins: Array<{ src: string, mode?: 'client' | 'server' }>) => Array<{ src: string, mode?: 'client' | 'server' }>}
   */
  extendPlugins: null,

  /**
   * An object where each key name maps to a path to a layout .vue file.
   *
   * Normally, there is no need to configure this directly.
   * @type {Record<string, string>}
   */
  layouts: {},

  /**
   * Set a custom error page layout.
   *
   * Normally, there is no need to configure this directly.
   * @type {string}
   */
  ErrorPage: null,

  /**
   * Configure the Nuxt loading progress bar component that's shown between
   * routes. Set to `false` to disable. You can also customize it or create
   * your own component.
   */
  loading: {
    /** CSS color of the progress bar. */
    color: 'black',
    /**
     * CSS color of the progress bar when an error appended while rendering
     * the route (if data or fetch sent back an error, for example).
     */
    failedColor: 'red',
    /** Height of the progress bar (used in the style property of the progress bar). */
    height: '2px',
    /**
     * In ms, wait for the specified time before displaying the progress bar.
     * Useful for preventing the bar from flashing.
     */
    throttle: 200,
    /**
     * In ms, the maximum duration of the progress bar, Nuxt assumes that the
     * route will be rendered before 5 seconds.
     */
    duration: 5000,
    /** Keep animating progress bar when loading takes longer than duration. */
    continuous: false,
    /** Set the direction of the progress bar from right to left. */
    rtl: false,
    /** Set to `false` to remove default progress bar styles (and add your own). */
    css: true
  },

  /**
   * Show a loading spinner while the page is loading (only when `ssr: false`).
   *
   * Set to `false` to disable. Alternatively, you can pass a string name or an object for more
   * configuration. The name can refer to an indicator from [SpinKit](https://tobiasahlin.com/spinkit/)
   * or a path to an HTML template of the indicator source code (in this case, all the
   * other options will be passed to the template).
   */
  loadingIndicator: {
    $resolve: async (val, get) => {
      val = typeof val === 'string' ? { name: val } : val
      return defu(val, {
        name: 'default',
        color: await get('loading.color') || '#D3D3D3',
        color2: '#F5F5F5',
        background: (await get('manifest') && await get('manifest.theme_color')) || 'white',
        dev: await get('dev'),
        loading: await get('messages.loading')
      })
    }
  },

  /**
   * Used to set the default properties of the page transitions.
   *
   * You can either pass a string (the transition name) or an object with properties to bind
   * to the `<Transition>` component that will wrap your pages.
   *
   * @see [vue@2 documentation](https://v2.vuejs.org/v2/guide/transitions.html)
   * @see [vue@3 documentation](https://vuejs.org/guide/built-ins/transition-group.html#enter-leave-transitions)
   */
  pageTransition: {
    $resolve: async (val, get) => {
      val = typeof val === 'string' ? { name: val } : val
      return defu(val, {
        name: 'page',
        mode: 'out-in',
        appear: await get('render.ssr') === false || Boolean(val),
        appearClass: 'appear',
        appearActiveClass: 'appear-active',
        appearToClass: 'appear-to'
      })
    }
  },

  /**
   * Used to set the default properties of the layout transitions.
   *
   * You can either pass a string (the transition name) or an object with properties to bind
   * to the `<Transition>` component that will wrap your layouts.
   *
   * @see [vue@2 documentation](https://v2.vuejs.org/v2/guide/transitions.html)
   */
  layoutTransition: {
    $resolve: val => {
      val = typeof val === 'string' ? { name: val } : val
      return defu(val, {
        name: 'layout',
        mode: 'out-in'
      })
    }
  },

  /**
   * You can disable specific Nuxt features that you do not want.
   */
  features: {
    /** Set to false to disable Nuxt vuex integration */
    store: true,
    /** Set to false to disable layouts */
    layouts: true,
    /** Set to false to disable Nuxt integration with `vue-meta` and the `head` property */
    meta: true,
    /** Set to false to disable middleware */
    middleware: true,
    /** Set to false to disable transitions */
    transitions: true,
    /** Set to false to disable support for deprecated features and aliases */
    deprecations: true,
    /** Set to false to disable the Nuxt `validate()` hook */
    validate: true,
    /** Set to false to disable the Nuxt `asyncData()` hook */
    useAsyncData: true,
    /** Set to false to disable the Nuxt `fetch()` hook */
    fetch: true,
    /** Set to false to disable `$nuxt.isOnline` */
    clientOnline: true,
    /** Set to false to disable prefetching behavior in `<NuxtLink>` */
    clientPrefetch: true,
    /** Set to false to disable extra component aliases like `<NLink>` and `<NChild>` */
    componentAliases: true,
    /** Set to false to disable the `<ClientOnly>` component (see [docs](https://github.com/egoist/vue-client-only)) */
    componentClientOnly: true
  }
})
