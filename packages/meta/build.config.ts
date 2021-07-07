import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/module',
    'src/index',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' }
  ],
  dependencies: [
    '@vueuse/head',
    'vue-meta'
  ]
})
