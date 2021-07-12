import { defineNuxtModule, extendBuild, useNuxt } from '@nuxt/kit'
import { createUnplugin, UnpluginFactory } from 'unplugin'

// could go `@nuxt/kit`
function addUnplugin<UserOptions = {}> (factory: UnpluginFactory<UserOptions>) {
  const nuxt = useNuxt()
  const plugin = createUnplugin(factory)

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

    addUnplugin(() => {
      return {
        name: 'unplugin-test',
        transformInclude (id) {
          return id.endsWith('.vue')
        },
        transform (code) {
          return code.replace(/<template>/, `<template><div>Injected ${i++}</div>`)
        }
      }
    })
  }
})
