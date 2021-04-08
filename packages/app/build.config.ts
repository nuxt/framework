import { BuildConfig } from 'unbuild'

export default <BuildConfig> {
  entries: [
    { input: 'src/', name: 'app' },
    { input: 'src/index' }
  ],
  dependencies: [
    '@vueuse/head',
    'ohmyfetch',
    'vue-router',
    'vuex5'
  ]
}
