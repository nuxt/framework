import { resolve } from 'node:path'
import { ComponentsDir } from '@nuxt/schema'
import { expect, it, vi } from 'vitest'
import { scanComponents } from '../src/components/scan'

const fixtureDir = resolve(__dirname, 'fixture')
const rFixture = (...p) => resolve(fixtureDir, ...p)

vi.mock('@nuxt/kit', () => ({
  isIgnored: () => false
}))

const dirs: ComponentsDir[] = [
  {
    path: rFixture('components'),
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
    path: rFixture('components'),
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
    path: rFixture('components'),
    extensions: [
      'vue'
    ],
    prefix: 'nuxt',
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

const expectedComponents = [
  {
    mode: 'all',
    pascalName: 'HelloWorld',
    kebabName: 'hello-world',
    chunkName: 'components/hello-world',
    shortPath: 'components/HelloWorld.vue',
    export: 'default',
    global: undefined,
    prefetch: false,
    preload: false
  },
  {
    mode: 'client',
    pascalName: 'Nuxt3',
    kebabName: 'nuxt3',
    chunkName: 'components/nuxt3-client',
    shortPath: 'components/Nuxt3.client.vue',
    export: 'default',
    global: undefined,
    prefetch: false,
    preload: false
  },
  {
    mode: 'server',
    pascalName: 'Nuxt3',
    kebabName: 'nuxt3',
    chunkName: 'components/nuxt3-server',
    shortPath: 'components/Nuxt3.server.vue',
    export: 'default',
    global: undefined,
    prefetch: false,
    preload: false
  },
  {
    mode: 'server',
    pascalName: 'ParentFolder',
    kebabName: 'parent-folder',
    chunkName: 'components/parent-folder-server',
    shortPath: 'components/parent-folder/index.server.vue',
    export: 'default',
    global: undefined,
    prefetch: false,
    preload: false
  }
]

const srcDir = rFixture('.')

it('components:scanComponents', async () => {
  const scannedComponents = await scanComponents(dirs, srcDir)
  for (const c of scannedComponents) {
    delete c.filePath
  }
  expect(scannedComponents).deep.eq(expectedComponents)
})
