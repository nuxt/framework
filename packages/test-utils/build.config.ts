import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/index',
    'src/runners/vitest'
  ],
  dependencies: [
  ],
  externals: [
    'vitest',
    'playwright',
    'playwright-core'
  ]
})
