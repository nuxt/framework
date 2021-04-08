import type { BuildConfig } from 'unbuild'

export default <BuildConfig> {
  entries: [
    'src/index'
  ],
  externals: [
    'nuxt3'
  ]
}
