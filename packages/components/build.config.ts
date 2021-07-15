import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: false,
  entries: [
    'src/module',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' }
  ]
})
