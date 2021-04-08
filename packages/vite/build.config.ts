import type { BuildConfig } from 'unbuild'

export default <BuildConfig> {
  entries: [
    'src/index'
  ],
  dependencies: [
    '@nuxt/kit',
    '@vue/compiler-sfc',
    'vue'
  ]
}
