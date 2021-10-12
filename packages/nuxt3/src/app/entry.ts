import { createSSRApp, createApp, nextTick } from 'vue'
import { createNuxtApp, applyPlugins, normalizePlugins, CreateOptions } from '#app'
import '#build/css'
// @ts-ignore
import _plugins from '#build/plugins'
// @ts-ignore
import App from '#build/app'

const plugins = normalizePlugins(_plugins)

export async function entry (ssrContext?: CreateOptions['ssrContext']) {
  if (process.server) {
    const app = createApp(App)
    const nuxt = createNuxtApp({ app, ssrContext })
    await applyPlugins(nuxt, plugins)
    await nuxt.hooks.callHook('app:created', app)
    return app
  }
  if (process.client) {
    const isSSR = Boolean(window.__NUXT__?.serverRendered)
    const app = isSSR ? createSSRApp(App) : createApp(App)
    const nuxt = createNuxtApp({ app })
    await applyPlugins(nuxt, plugins)
    await nuxt.hooks.callHook('app:created', app)
    await nuxt.hooks.callHook('app:beforeMount', app)
    nuxt.hooks.hookOnce('page:finish', () => {
      nuxt.isHydrating = false
    })
    app.mount('#__nuxt')
    await nuxt.hooks.callHook('app:mounted', app)
    await nextTick()
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

  entry().catch((error) => {
    console.error('Error while mounting app:', error) // eslint-disable-line no-console
  })
}

if (process.server) {
  // Bundle server-renderer and provide to nitro renderer
  entry.getRenderToString = async () => {
    const { renderToString } = await import('vue/server-renderer')
    // @ts-ignore
    return (...args) => renderToString(...args)
      .then(result => `<div id="__nuxt">${result}</div>`)
  }
}
