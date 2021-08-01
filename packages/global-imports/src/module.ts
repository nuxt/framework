import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import { generateTemplate } from './dev'
import { BuildPlugin } from './build'
import { identifiers } from './identifiers'

export default defineNuxtModule({
  name: 'global-imports',
  setup (_options, nuxt) {
    if (nuxt.options.dev) {
      generateTemplate(nuxt, identifiers)
    } else {
      addVitePlugin(BuildPlugin.vite(identifiers))
      addWebpackPlugin(BuildPlugin.webpack(identifiers))
    }
  }
})
