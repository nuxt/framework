import { useNuxt } from '@nuxt/kit'
import { installModule } from '@nuxt/kit/src'
import scriptSetupPlugin from 'unplugin-vue2-script-setup/nuxt'
import type { ScriptSetupOptions } from '../types'

export const setupScriptSetup = async (options: ScriptSetupOptions) => {
  const nuxt = useNuxt()
  const config = options === true ? {} : options

  nuxt.hook('prepare:types', ({ references }) => {
    references.push({
      types: 'unplugin-vue2-script-setup/types'
    })
  })

  await installModule(scriptSetupPlugin, config)
}
