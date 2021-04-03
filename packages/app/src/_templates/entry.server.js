import { createApp, h } from 'vue'
import { createNuxt, applyPlugins } from '@nuxt/app'
import plugins from './plugins'
import serverPlugins from './plugins.server'
import App from '<%= app.main %>'

export default async function createNuxtAppServer (ssrContext = {}) {
  const globalSetups = []
  const app = createApp({
    render: () => h(App),
    setup(_props, context) {
      globalSetups.forEach(setup => setup(context))
    }
  })

  const nuxt = createNuxt({ app, ssrContext })
  nuxt._globalSetups = globalSetups

  await applyPlugins(nuxt, plugins)
  await applyPlugins(nuxt, serverPlugins)

  await app.$nuxt.hooks.callHook('app:created', app)

  nuxt.hooks.hook('vue-renderer:done',
    () => nuxt.hooks.callHook('app:rendered', app)
  )

  return app
}
