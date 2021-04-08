import type { BuildConfig } from 'unbuild'

export default <BuildConfig>{
  entries: [
    {
      input: 'src/config/schema/index',
      name: 'config',
      builder: 'untyped',
      defaults: {
        rootDir: '<rootDir>'
      }
    },
    'src/index'
  ]
}
