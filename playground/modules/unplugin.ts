import { defineNuxtModule, extendBuild, useNuxt } from '@nuxt/kit'
import { defineUnplugin, UnpluginOptions } from 'unplugin'

// could go `@nuxt/kit`
function addUnplugin<UserOptions = {}> (pluginOptions: UnpluginOptions<UserOptions>) {
  const nuxt = useNuxt()
  const plugin = defineUnplugin(pluginOptions)

  if (nuxt.options.vite) {
    // vite
    nuxt.hook('vite:extend', (vite: any) => {
      vite.config.plugins.push(plugin.rollup())
    })
  } else {
    // webpack
    extendBuild((config: any) => {
      config.plugins = config.plugins || []
      config.plugins.push(plugin.webpack())
    })
  }
}

export default defineNuxtModule({
  setup () {
    let i = 0
    addUnplugin({
      name: 'unplugin-test',
      enforce: 'pre',
      setup () {
        return {
          transformInclude (id) {
            return id.endsWith('.vue')
          },
          transform (code) {
            return code.replace(/<template>/, `<template><div>Injected ${i++}</div>`)
          }
        }
      }
    })
  }
})
