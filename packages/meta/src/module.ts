import { resolve } from 'upath'
import { addTemplate, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  name: 'meta',
  defaults: {
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1'
  },
  setup (options, nuxt) {
    const runtimeDir = resolve(__dirname, 'runtime')

    nuxt.options.build.transpile.push('@nuxt/meta', runtimeDir)
    nuxt.options.alias['@nuxt/meta'] = resolve(runtimeDir, 'index')

    const { dst: implementation } = addTemplate({
      src: resolve(runtimeDir, 'vueuse-head.mjs'),
      options
    })

    nuxt.hook('app:resolve', (app) => {
      app.plugins.push({ src: resolve(nuxt.options.buildDir, implementation) })
      app.plugins.push({ src: resolve(runtimeDir, 'meta') })
    })
  }
})
