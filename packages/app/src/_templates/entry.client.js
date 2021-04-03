<%= nuxtOptions.vite ? "import('vite/dynamic-import-polyfill')" : '' %>
import { createSSRApp, h, nextTick } from 'vue'
import { createNuxt, applyPlugins } from '@nuxt/app'
import plugins from './plugins'
import clientPlugins from './plugins.client'
import App from '<%= app.main %>'

async function initApp () {
  const globalSetups = []
  const app = createSSRApp({
    render: () => h(App),
    setup(_props, context) {
      globalSetups.forEach(setup => setup(context))
    }
  })

  const nuxt = createNuxt({ app })
  nuxt._globalSetups = globalSetups

  await applyPlugins(nuxt, plugins)
  await applyPlugins(nuxt, clientPlugins)

  await app.$nuxt.hooks.callHook('app:created', app)
  await app.$nuxt.hooks.callHook('app:beforeMount', app)

  app.mount('#__nuxt')

  await app.$nuxt.hooks.callHook('app:mounted', app)
  await nextTick()
  nuxt.isHydrating = false
}

initApp().catch((error) => {
  console.error('Error while mounting app:', error) // eslint-disable-line no-console
})
