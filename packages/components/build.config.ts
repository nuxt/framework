import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: false,
  // declaration: true,
  entries: [
    'src/module',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' }
  ]
})
