import { defineNuxtModule, installModule } from '@nuxt/kit'
import { setupNitroBridge } from './nitro'

export default defineNuxtModule({
  name: 'nuxt-bridge',
  defaults: {
    nitro: true,
    vite: false
  },
  async setup (opts, nuxt) {
    if (opts.nitro) {
      await setupNitroBridge()
    }
    if (opts.vite) {
      await installModule(nuxt, require.resolve('nuxt-vite'))
    }
  }
})
