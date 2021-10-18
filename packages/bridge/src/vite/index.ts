import { resolve } from 'pathe'
import consola from 'consola'
import { lt } from 'semver'
import { version } from '../../package.json'
import type { ViteOptions } from './types'

function nuxtVite () {
  const { nuxt } = this
  const viteOptions = nuxt.options.vite || {}

  // Only enable for development or production if `build: true` is set
  if (!nuxt.options.dev && !viteOptions.build) {
    return
  }

  // Check nuxt version
  const minVersion = '2.15.2'
  const currentVersion = (nuxt.constructor.version || '0.0.0').split('-')[0]
  if (lt(currentVersion, minVersion)) {
    // eslint-disable-next-line no-console
    consola.warn(`Disabling nuxt-vite since nuxt >= ${minVersion} is required (current version: ${currentVersion})`)
    return
  }

  nuxt.options.cli.badgeMessages.push(`⚡  Vite Mode Enabled (v${version})`)
  // eslint-disable-next-line no-console
  if (nuxt.options.vite?.experimentWarning !== false && !nuxt.options.test) {
    consola.log(
      '🧪  Vite mode is experimental and some nuxt modules might be incompatible\n',
      '   If found a bug, please report via https://github.com/nuxt/vite/issues with a minimal reproduction.'
    )
  }

  // Disable loading-screen because why have it!
  nuxt.options.build.loadingScreen = false
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
    this.addTemplate({
      src: resolve(__dirname, './runtime/templates', 'store.mjs'),
      fileName: 'store.js'
    })
  }
  this.addTemplate({
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

nuxtVite.meta = { name: 'nuxt-vite', version }

export default nuxtVite

declare module '@nuxt/types/config/index' {
  interface NuxtOptions {
    /**
     * Configuration for Vite.
     * Severe the same functionality as Vite's `vite.config.ts`.
     * It will merges with Nuxt specify configurations and plugins.
     *
     * @see https://vitejs.dev/config/
     */
    vite?: ViteOptions & {
      ssr: boolean | ViteOptions['ssr'],
      build: boolean | ViteOptions['build'],
      experimentWarning: boolean
    }
  }
}
