import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  emitCJS: false,
  entries: [
    'src/module',
    'src/dirs',
    { input: 'src/vite/index', name: 'vite.module' },
    { input: 'src/vite/vite', name: 'vite' },
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm', declaration: true }
  ],
  externals: [
    'webpack',
    'vite'
  ]
})
