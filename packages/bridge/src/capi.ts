import { useNuxt, addPlugin, addPluginTemplate, addVitePlugin, addWebpackPlugin } from '@nuxt/kit'
import { resolve } from 'pathe'

import { distDir } from './dirs'
import { KeyPlugin } from './capi-legacy-key-plugin'

export function setupCAPIBridge (_options: any) {
  const nuxt = useNuxt()

  // Error if `@nuxtjs/composition-api` is added
  if (nuxt.options.buildModules.find(m => m === '@nuxtjs/composition-api' || m === '@nuxtjs/composition-api/module')) {
    throw new Error('Please remove `@nuxtjs/composition-api` from `buildModules` to avoid conflict with bridge.')
  }

  // Add composition-api support
  nuxt.options.alias['@vue/composition-api'] = require.resolve('@vue/composition-api/dist/vue-composition-api.mjs')
  const capiPluginPath = resolve(distDir, 'runtime/capi.plugin.mjs')
  addPluginTemplate({ filename: 'capi.plugin.mjs', src: capiPluginPath })

  // Add support for useNuxtApp
  const appPlugin = addPluginTemplate(resolve(distDir, 'runtime/app.plugin.mjs'))
  nuxt.hook('modules:done', () => {
    nuxt.options.plugins.unshift(appPlugin)
  })

  // Register Composition API before loading the rest of app
  nuxt.hook('webpack:config', (configs) => {
    // @ts-ignore
    configs.forEach(config => config.entry.app.unshift(capiPluginPath))
  })

  // Handle legacy `@nuxtjs/composition-api`
  nuxt.options.alias['@nuxtjs/composition-api'] = resolve(distDir, 'runtime/capi.legacy.mjs')
  nuxt.options.build.transpile.push('@nuxtjs/composition-api', '@vue/composition-api')
  addPlugin(resolve(distDir, 'runtime/capi.legacy.plugin.mjs'))

  // Enable automatic ssrRef key generation
  addVitePlugin(KeyPlugin.vite())
  addWebpackPlugin(KeyPlugin.webpack())

  // TODO: Add @nuxtjs/composition-api shims
}
