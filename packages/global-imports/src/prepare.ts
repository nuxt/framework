import { promises as fs } from 'fs'
import { join, relative } from 'upath'
import { Nuxt } from '@nuxt/kit'
import { IdentifierMap } from './types'

export function generateTypes (nuxt: Nuxt, identifiers: IdentifierMap) {
  nuxt.hook('prepare:types', async ({ references }) => {
    await fs.writeFile(
      join(nuxt.options.buildDir, 'global-imports.d.ts'),
      `declare global {
        ${Object.entries(identifiers).map(([api, moduleName]) => `  const ${api}: typeof import('${moduleName}')['${api}']`).join('\n')}
      }
      export {}`,
      'utf-8'
    )
    const path = join(relative(nuxt.options.rootDir, nuxt.options.buildDir), 'global-imports.d.ts')
    references.push(`/// <reference types="${path}" />`)
  })
}
