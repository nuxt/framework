import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  emitCJS: false,
  entries: [
    {
      input: 'src/config/index',
      outDir: 'schema',
      name: 'config',
      builder: 'untyped',
      defaults: {
        rootDir: '/project/'
      }
    },
    'src/index'
  ],
  externals: [
    // Type imports
    'nuxt3',
    'vue-meta',
    'vue',
    'hookable',
    'webpack',
    'pkg-types',
    'webpack-bundle-analyzer',
    'rollup-plugin-visualizer',
    'vite',
    // Implicit
    '@vue/compiler-core',
    '@vue/shared ',
  ]
})
