import { Nuxt } from '@nuxt/kit'
import { resolve } from 'upath'
import { IdentifierMap } from '../types'
import { toImports } from '../utils'

export function generateTemplate (nuxt: Nuxt, identifiers: IdentifierMap) {
  nuxt.hook('app:templates', (app) => {
    const imports = toImports(Object.entries(identifiers))
    const globals = Object.keys(identifiers).map(name => `globalThis.${name} = ${name};`).join('')

    app.templates.push({
      path: 'global-imports.mjs',
      src: resolve(__dirname, '../runtime/template.txt'),
      data: { content: imports + globals + 'export default () => {};' }
    })
    app.templates.push({
      path: 'global-imports.d.ts',
      src: resolve(__dirname, '../runtime/template.txt'),
      data: { content: '' }
    })

    // TODO: inject before app mount
    app.plugins.unshift({ src: '#build/global-imports', mode: 'all' })
  })
}
