import { Component } from '@nuxt/schema'
import MagicString from 'magic-string'
import { findStaticImports } from 'mlly'
import { createUnplugin } from 'unplugin'

interface StripServerComponentsPluginOptions {
  getComponents(): Component[]
  sourcemap?: boolean
}

export const stripServerComponentsPlugin = createUnplugin((options: StripServerComponentsPluginOptions) => {
  return {
    name: 'nuxt:components:strip-server-components',
    enforce: 'post',
    transformInclude (id) {
      const components = options.getComponents()
      return components.some(c => c.filePath === id && c.mode === 'server' && !components.some(o => o.mode === 'client' && o.pascalName === c.pascalName))
    },
    transform (code, id) {
      const s = new MagicString(code)
      const imports = findStaticImports(code)
        .filter(i => i.type === 'static' && i.specifier.match(/\.css$/))
        .map(i => i.code)

      s.overwrite(0, code.length, imports.join('\n'))

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: options.sourcemap && s.generateMap({ source: id, includeContent: true })
        }
      }
    }
  }
})
