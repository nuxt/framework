import { defineNuxtModule, installModule } from '@nuxt/kit'
import { createResolve } from 'mlly'
import { setupNitroBridge } from './nitro'
import { setupAppBridge } from './app'

export default defineNuxtModule({
  name: 'nuxt-bridge',
  configKey: 'bridge',
  defaults: {
    nitro: true,
    vite: false,
    app: true,
    // TODO: Remove from 2.16
    postcss8: true,
    swc: true
  },
  async setup (opts, nuxt) {
    if (opts.nitro) {
      await setupNitroBridge()
    }
    if (opts.app) {
      await setupAppBridge()
    }
    const r = createResolve({ from: import.meta.url })
    if (opts.vite) {
      await installModule(nuxt, await r('nuxt-vite'))
    }
    if (opts.postcss8) {
      await installModule(nuxt, await r('@nuxt/postcss8'))
    }
    if (opts.swc) {
      await installModule(nuxt, await r('nuxt-swc'))
    }
  }
})
