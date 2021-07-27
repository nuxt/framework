import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import { generateTemplate } from './dev'
import { BuildPlugin } from './build'

export default defineNuxtModule({
  name: 'global-imports',
  setup (_options, nuxt) {
    // TODO: provide full list preset for composition API
    const identifiers = {
      ref: 'vue',
      computed: 'vue'
    }

    if (nuxt.options.dev) {
      generateTemplate(nuxt, identifiers)
    } else {
      addVitePlugin(BuildPlugin.vite(identifiers))
      addWebpackPlugin(BuildPlugin.webpack(identifiers))
    }
  }
})
