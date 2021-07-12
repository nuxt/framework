import { defineNuxtModule, extendBuild } from '@nuxt/kit'
import { defineUnplugin } from 'unplugin'

export default defineNuxtModule({
  setup (_, nuxt) {
    let i = 0
    const plugin = defineUnplugin({
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

    // webpack
    extendBuild((config: any) => {
      config.plugins = config.plugins || []
      config.plugins.push(plugin.webpack())
    })

    // vite
    nuxt.hook('vite:extend', (vite: any) => {
      vite.config.plugins.push(plugin.rollup())
    })
  }
})
