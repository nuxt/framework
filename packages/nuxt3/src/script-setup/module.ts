import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import { transformNuxtSetup } from './transform'

export default defineNuxtModule({
  name: 'script-setup-nuxt',
  setup () {
    addVitePlugin(transformNuxtSetup.vite())
    addWebpackPlugin(transformNuxtSetup.webpack())
  }
})
