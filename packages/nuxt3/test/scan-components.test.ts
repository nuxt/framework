import { ComponentsDir } from '@nuxt/kit'

/**
 *
 * We want to test:
 * - already scanned path
 * - already filePaths
 * - with no prefix
 * - having an index.vue component
 * - different file name parts
 * - with extendComponent
 * - different component level
 *
 */

const srcDir: string = '/Users/nuxt/framework/examples/hello-world'
const dirs: ComponentsDir[] = [
  {
    path: '/Users/nuxt/framework/examples/hello-world/components',
    level: 0,
    enabled: true,
    extensions: [
      'vue'
    ],
    pattern: '**/*.{vue,}',
    ignore: [
      '**/*.stories.{js,ts,jsx,tsx}',
      '**/*{M,.m,-m}ixin.{js,ts,jsx,tsx}',
      '**/*.d.ts'
    ],
    transpile: false
  },
  {
    path: '/Users/nuxt/framework/examples/hello-world/components',
    level: 0,
    enabled: true,
    extensions: [
      'vue'
    ],
    pattern: '**/*.{vue,}',
    ignore: [
      '**/*.stories.{js,ts,jsx,tsx}',
      '**/*{M,.m,-m}ixin.{js,ts,jsx,tsx}',
      '**/*.d.ts'
    ],
    transpile: false
  },
  {
    path: '/Users/nuxt/framework/examples/hello-world/other-components',
    extensions: [
      'vue'
    ],
    prefix: 'nuxt',
    level: 0,
    enabled: true,
    pattern: '**/*.{vue,}',
    ignore: [
      '**/*.stories.{js,ts,jsx,tsx}',
      '**/*{M,.m,-m}ixin.{js,ts,jsx,tsx}',
      '**/*.d.ts'
    ],
    transpile: false
  }
]

describe('auto-imports:transform', () => {
  console.log(dirs, srcDir)
})
