import { addVitePlugin, addWebpackPlugin, useNuxt } from '@nuxt/kit'
import scriptSetupPlugin from 'unplugin-vue2-script-setup'

export const setupScriptSetup = () => {
  const nuxt = useNuxt()
  const options = nuxt.options.scriptSetup
  
  addVitePlugin(scriptSetupPlugin.vite(options))
  addWebpackPlugin(scriptSetupPlugin.webpack(options))

  nuxt.hook('prepare:types', ({ references }) => {
    references.push({
      types: 'unplugin-vue2-script-setup/types'
    })
  })
}
