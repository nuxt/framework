import { Nuxt } from '@nuxt/kit'
import { IdentifierMap } from './types'
import { toImports } from './utils'

export function generateTemplate (nuxt: Nuxt, identifiers: IdentifierMap) {
  nuxt.hook('app:templates', (app) => {
    const imports = toImports(Object.entries(identifiers))
    const globals = Object.keys(identifiers).map(name => `globalThis.${name} = ${name};`).join('')

    app.templates.push({
      filename: 'global-imports.mjs',
      getContents: () => `${imports}\n${globals}\nexport default () => {};`
    })

    app.plugins.unshift({ src: '#build/global-imports' })
  })
}
