import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/index',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' }
  ],
  dependencies: [
  ],
  externals: [
    'vitest',
    'playwright',
    'playwright-core',
    'listhen'
  ]
})
