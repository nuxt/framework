import { createSSRApp, createApp, nextTick } from 'vue'
import { createNuxtApp, applyPlugins, normalizePlugins, CreateOptions, normalizeError } from '#app'
import '#build/css'
// @ts-ignore
import _plugins from '#build/plugins'
// @ts-ignore
import App from '#build/app'

let entry: Function

const plugins = normalizePlugins(_plugins)

if (process.server) {
  entry = async function createNuxtAppServer (ssrContext: CreateOptions['ssrContext'] = {}) {
    const app = createApp(App)

    const nuxt = createNuxtApp({ app, ssrContext })
    try {
      await applyPlugins(nuxt, plugins)

      await nuxt.hooks.callHook('app:created', app)
    } catch (e) {
      nuxt.payload.errors.push(normalizeError(e))
      nuxt.callHook('error:captured', nuxt.payload.errors)
    }

    return app
  }
}

if (process.client) {
  // TODO: temporary webpack 5 HMR fix
  // https://github.com/webpack-contrib/webpack-hot-middleware/issues/390
  // @ts-ignore
  if (process.dev && import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.accept()
  }

  entry = async function initApp () {
    const isSSR = Boolean(window.__NUXT__?.serverRendered)
    const app = isSSR ? createSSRApp(App) : createApp(App)

    const nuxt = createNuxtApp({ app })

    try {
      await applyPlugins(nuxt, plugins)

      await nuxt.hooks.callHook('app:created', app)
      await nuxt.hooks.callHook('app:beforeMount', app)

      nuxt.hooks.hookOnce('page:finish', () => {
        nuxt.isHydrating = false
      })

      app.mount('#__nuxt')

      await nuxt.hooks.callHook('app:mounted', app)
      await nextTick()
    } catch (e) {
      nuxt.payload.errors.push(normalizeError(e))
      nuxt.callHook('error:captured', nuxt.payload.errors)
    }
  }

  entry().catch((error) => {
    console.error('Error while mounting app:', error) // eslint-disable-line no-console
  })
}

export default (ctx?: CreateOptions['ssrContext']) => entry(ctx)
