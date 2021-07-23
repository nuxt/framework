import { defineNuxtModule, addUnplugin } from '@nuxt/kit'

export default defineNuxtModule({
  setup () {
    let i = 0
    const date = new Date().toString()

    addUnplugin(() => {
      return {
        name: 'unplugin-test',
        transformInclude (id) {
          return id.endsWith('.vue')
        },
        transform (code) {
          return code.replace(/<template>/, `<template><div>Injected ${i++}</div>`)
        },
        resolveId (id) {
          if (id === 'virtual-build-time') {
            return '/node_modules/' + id
          }
          return null
        },
        load (id) {
          console.log('load', id)
          if (id === '/node_modules/virtual-build-time') {
            return 'export default ' + JSON.stringify(date)
          }
        }
      }
    })
  }
})
