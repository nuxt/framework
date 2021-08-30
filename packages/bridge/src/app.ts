import { useNuxt, addPluginTemplate } from '@nuxt/kit'
import { resolve } from 'upath'
import { distDir } from './dirs'

export function setupAppBridge () {
  const nuxt = useNuxt()

  nuxt.options.alias['#app'] = resolve(distDir, 'runtime/index.mjs')
  nuxt.options.alias['#build'] = nuxt.options.buildDir
  nuxt.options.alias['@vue/composition-api'] = require.resolve('@vue/composition-api/dist/vue-composition-api.mjs')

  addPluginTemplate({
    filename: 'app-bridge.mjs',
    src: resolve(distDir, 'runtime/app-bridge.mjs')
  })
}
