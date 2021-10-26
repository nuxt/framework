import { ComponentsDir } from '@nuxt/kit'

describe('auto-imports:transform', () => {
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

  console.log(dirs, srcDir)
})
