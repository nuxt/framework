import { useNuxt, addPluginTemplate } from '@nuxt/kit'
import { resolve } from 'upath'
import { distDir } from './dirs'

export function setupCAPIBridge (_options: any) {
  const nuxt = useNuxt()

  // Add composition-api support
  nuxt.options.alias['@vue/composition-api'] = require.resolve('@vue/composition-api/dist/vue-composition-api.mjs')
  const capiPluginPath = resolve(distDir, 'runtime/capi.plugin.mjs')
  addPluginTemplate({ filename: 'capi.plugin.mjs', src: capiPluginPath })
  nuxt.hook('webpack:config', (configs) => {
    // @ts-ignore
    configs.forEach(config => config.entry.app.unshift(capiPluginPath))
  })

  // TODO: Add @nuxtjs/composition-api shims
}
