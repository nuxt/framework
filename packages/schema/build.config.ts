import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    {
      input: 'src/config/index',
      outDir: 'schema',
      name: 'config',
      builder: 'untyped',
      defaults: {
        rootDir: '/<rootDir>/',
        vite: {
          base: '/'
        }
      }
    },
    'src/index'
  ],
  externals: [
    // Type imports
    'vue-meta',
    'vue',
    'hookable',
    'webpack',
    'pkg-types',
    'webpack-bundle-analyzer',
    'rollup-plugin-visualizer',
    'vite',
    'mini-css-extract-plugin',
    'terser-webpack-plugin',
    'css-minimizer-webpack-plugin',
    'webpack-dev-middleware',
    'webpack-hot-middleware',
    'postcss',
    'consola',
    // Implicit
    '@vue/compiler-core',
    '@vue/shared'
  ]
})
