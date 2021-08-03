import { promises as fs } from 'fs'
import { join } from 'upath'
import { Nuxt } from '@nuxt/kit'
import { Component } from './types'

export async function generateTypes (nuxt: Nuxt, components: Component[]) {
  const types = components
    .map(c => `    '${c.pascalName}': typeof import('${c.filePath}')['${c.export}']`)
    .join(',\n')

  await fs.writeFile(
    join(nuxt.options.buildDir, 'components.d.ts'),
`declare module 'vue' {
  export interface GlobalComponents {
${types}
  }
}
export { }
`
  )
}
