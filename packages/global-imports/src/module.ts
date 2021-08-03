import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import { generateTemplate } from './dev'
import { BuildPlugin } from './build'
import { defaultIdentifiers } from './identifiers'
import { generateTypes } from './prepare'
import { GlobalImportsOptions } from './types'

export default defineNuxtModule<GlobalImportsOptions>({
  name: 'global-imports',
  configKey: 'globalImports',
  defaults: { identifiers: defaultIdentifiers },
  setup ({ identifiers }, nuxt) {
    generateTypes(nuxt, identifiers)

    if (nuxt.options.dev) {
      generateTemplate(nuxt, identifiers)
    } else {
      addVitePlugin(BuildPlugin.vite(identifiers))
      addWebpackPlugin(BuildPlugin.webpack(identifiers))
    }
  }
})
