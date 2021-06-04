import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    { input: 'src/', name: 'app' }
  ],
  dependencies: [
    '@vueuse/head',
    'vue-meta',
    'ohmyfetch',
    'vue-router',
    'vuex5'
  ]
})
