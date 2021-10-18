import { resolve } from 'pathe'
import consola from 'consola'
import { addPluginTemplate, defineNuxtModule } from '@nuxt/kit'
import { version } from '../../package.json'
import type { ViteOptions } from './types'

export default defineNuxtModule<ViteOptions>({
  name: 'nuxt-bridge:vite',
  defaults: {},
  version,
  setup (viteOptions, nuxt) {
    // Only enable for development or production if `build: true` is set
    if (!nuxt.options.dev && !viteOptions.build) {
      return
    }

    nuxt.options.cli.badgeMessages.push(`⚡  Vite Mode Enabled (v${version})`)
    // eslint-disable-next-line no-console
    if (viteOptions.experimentWarning !== false && !nuxt.options.test) {
      consola.log(
        '🧪  Vite mode is experimental and some nuxt modules might be incompatible\n',
        '   If found a bug, please report via https://github.com/nuxt/vite/issues with a minimal reproduction.'
      )
    }

    // Disable loading-screen because why have it!
    // @ts-expect-error
    nuxt.options.build.loadingScreen = false
    // @ts-expect-error
    nuxt.options.build.indicator = false
    nuxt.options._modules = nuxt.options._modules
      .filter(m => !(Array.isArray(m) && m[0] === '@nuxt/loading-screen'))

    // Mask nuxt-vite  to avoid other modules depending on it's existence
    // TODO: Move to kit
    const getModuleName = (m) => {
      if (Array.isArray(m)) { m = m[0] }
      return m.meta ? m.meta.name : m
    }
    const filterModule = modules => modules.filter(m => getModuleName(m) !== 'nuxt-vite')
    nuxt.options.modules = filterModule(nuxt.options.modules)
    nuxt.options.buildModules = filterModule(nuxt.options.buildModules)

    if (nuxt.options.store) {
      addPluginTemplate({
        src: resolve(__dirname, './runtime/templates', 'store.mjs'),
        fileName: 'store.js'
      })
    }

    addPluginTemplate({
      src: resolve(__dirname, './runtime/templates', 'middleware.mjs'),
      fileName: 'middleware.js'
    })

    nuxt.hook('builder:prepared', async (builder) => {
      builder.bundleBuilder.close()
      delete builder.bundleBuilder
      const { ViteBuilder } = await import('./vite')
      builder.bundleBuilder = new ViteBuilder(builder)
    })
  }
})
