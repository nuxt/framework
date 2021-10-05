import { createRequire } from 'module'
import { defineNuxtModule, installModule, checkNuxtCompatibilityIssues } from '@nuxt/kit'
import { setupNitroBridge } from './nitro'
import { setupAppBridge } from './app'
import { setupCAPIBridge } from './capi'
import { setupBetterResolve } from './resolve'
import { setupGlobalImports } from './global-imports'

export interface BridgeConfig  {
  nitro: boolean
  vite: boolean
  app: boolean | {}
  capi: boolean | {}
  globalImports: boolean
  constraints: boolean
  postcss8: boolean
  swc: boolean
  resolve: boolean
}

export default defineNuxtModule({
  name: 'nuxt-bridge',
  configKey: 'bridge',
  defaults: {
    nitro: true,
    vite: false,
    app: {},
    capi: {},
    globalImports: true,
    constraints: true,
    // TODO: Remove from 2.16
    postcss8: true,
    swc: true,
    resolve: true
  } as BridgeConfig,
  async setup (opts, nuxt) {
    const _require = createRequire(import.meta.url)

    if (opts.nitro) {
      await setupNitroBridge()
    }
    if (opts.app) {
      await setupAppBridge(opts.app)
    }
    if (opts.capi) {
      if (!opts.app) {
        throw new Error('[bridge] Cannot enable composition-api with app disabled!')
      }
      await setupCAPIBridge(opts.capi)
    }
    if (opts.globalImports) {
      await setupGlobalImports()
    }
    if (opts.vite) {
      await installModule(nuxt, _require.resolve('nuxt-vite'))
    }
    if (opts.postcss8) {
      await installModule(nuxt, _require.resolve('@nuxt/postcss8'))
    }
    if (opts.swc) {
      await installModule(nuxt, _require.resolve('nuxt-swc'))
    }
    if (opts.resolve) {
      setupBetterResolve()
    }
    if (opts.constraints) {
      nuxt.hook('modules:done', (moduleContainer: any) => {
        for (const [name, m] of Object.entries(moduleContainer.requiredModules || {})) {
          const requires = (m as any)?.handler?.meta?.requires
          if (requires) {
            const issues = checkNuxtCompatibilityIssues(requires, nuxt)
            if (issues.length) {
              console.warn(`[bridge] Detected module incompatibility issues for \`${name}\`:\n` + issues.toString())
            }
          }
        }
      })
    }
  }
})

declare module '@nuxt/kit' {
  interface NuxtConfig {
    bridge?: BridgeConfig
  }
}

// @ts-ignore
declare module '@nuxt/types' {
  interface NuxtConfig {
    bridge?: BridgeConfig
  }
}
