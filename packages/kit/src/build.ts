import type { WebpackPluginInstance, Configuration as WebpackConfig } from 'webpack'
import type { Plugin as VitePlugin, UserConfig as ViteConfig } from 'vite'
import { isFalse } from '@nuxt/utils'
import { useNuxt } from './context'
export interface ExtendConfigOptions {
  /**
   * Install plugin on dev
   *
   * @default true
   */
  dev?: boolean
  /**
   * Install plugin on build
   *
   * @default true
   */
  build?: boolean
  /**
   * Install plugin on server side
   *
   * @default true
   */
  server?: boolean
  /**
   * Install plugin on client side
   *
   * @default true
   */
  client?: boolean
}

export interface ExtendWebpackConfigOptions extends ExtendConfigOptions {
  /**
   * Install plugin on modern build
   *
   * @default true
   * @deprecated Nuxt 2 only
   */
  modern?: boolean
}

export interface ExtendViteConfigOptions extends ExtendConfigOptions { }

/**
 * Extend Webpack config
 *
 * The fallback function might be called multiple times
 * when applying to both client and server builds.
 */
export function extendWebpackConfig (
  fn: ((config: WebpackConfig) => void),
  options: ExtendWebpackConfigOptions = {}
) {
  const nuxt = useNuxt()

  if ((isFalse(options.dev) && nuxt.options.dev) || (isFalse(options.build) && nuxt.options.build)) {
    return
  }

  nuxt.hook('webpack:config', (configs: WebpackConfig[]) => {
    if (!isFalse(options.server)) {
      const config = configs.find(i => i.name === 'server')
      if (config) {
        fn(config)
      }
    }
    if (!isFalse(options.client)) {
      const config = configs.find(i => i.name === 'client')
      if (config) {
        fn(config)
      }
    }
    // Nuxt 2 backwards compatibility
    if (!isFalse(options.modern)) {
      const config = configs.find(i => i.name === 'modern')
      if (config) {
        fn(config)
      }
    }
  })
}

/**
 * Extend Vite config
 */
export function extendViteConfig (
  fn: ((config: ViteConfig) => void),
  options: ExtendViteConfigOptions = {}
) {
  const nuxt = useNuxt()

  if ((isFalse(options.dev) && nuxt.options.dev) || (isFalse(options.build) && nuxt.options.build)) {
    return
  }

  if (!isFalse(options.server) && !isFalse(options.client)) {
    // Call fn() only once
    return nuxt.hook('vite:extend', ({ config }) => fn(config))
  }

  nuxt.hook('vite:extendConfig', (config, { isClient, isServer }) => {
    if (!isFalse(options.server) && isServer) {
      return fn(config)
    }
    if (!isFalse(options.client) && isClient) {
      return fn(config)
    }
  })
}

/**
 * Append Webpack plugin to the config.
 */
export function addWebpackPlugin (plugin: WebpackPluginInstance, options?: ExtendWebpackConfigOptions) {
  extendWebpackConfig((config) => {
    config.plugins = config.plugins || []
    config.plugins.push(plugin)
  }, options)
}

/**
 * Append Vite plugin to the config.
 */
export function addVitePlugin (plugin: VitePlugin, options?: ExtendViteConfigOptions) {
  extendViteConfig((config) => {
    config.plugins = config.plugins || []
    config.plugins.push(plugin)
  }, options)
}
