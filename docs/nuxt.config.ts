import { withDocus } from '@docus/app'

export default withDocus({
  // TODO: Remove that temporary fix
  // Seem to be related to latest {Vite/nuxt-vite} version
  vite: {
    server: {
      fs: {
        strict: false
      }
    }
  },
  /**
   * Has to specify rootDir as we use nuxt-extend
   */
  rootDir: __dirname,
  /**
   * Modules
   */
  buildModules: [
    '@nuxt/typescript-build',
    '@docus/github',
    '@docus/twitter'
  ]
})
