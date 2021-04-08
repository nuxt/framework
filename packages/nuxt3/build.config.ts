import type { BuildConfig } from 'unbuild'

export default <BuildConfig> {
  entries: [
    'src/index'
  ],
  dependencies: [
    '@nuxt/app',
    '@nuxt/vite-builder',
    '@nuxt/webpack-builder',
    'nuxt-cli'
  ]
}
