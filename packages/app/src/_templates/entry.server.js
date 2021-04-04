import { createApp } from 'vue'
import { createNuxt, applyPlugins } from '@nuxt/app'
import plugins from './plugins'
import serverPlugins from './plugins.server'
import App from '<%= app.main %>'

export default async function createNuxtAppServer (ssrContext = {}) {
  const app = createApp(App)

  const nuxt = createNuxt({ app, ssrContext })

  await applyPlugins(nuxt, plugins)
  await applyPlugins(nuxt, serverPlugins)

  await nuxt.hooks.callHook('app:created', app)

  // Call render hook on Nuxt 2
  nuxt.hooks.hook('render:routeContext',
    () => nuxt.hooks.callHook('app:rendered', app)
  )

  return app
}
