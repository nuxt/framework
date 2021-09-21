import { resolve } from 'path'
import { addVitePlugin, addWebpackPlugin, defineNuxtModule, addTemplate, resolveAlias, addPluginTemplate } from '@nuxt/kit'
import type { Identifiers, GlobalImportsOptions } from './types'
import { TransformPlugin } from './transform'
import { defaultIdentifiers } from './identifiers'

export default defineNuxtModule<GlobalImportsOptions>({
  name: 'global-imports',
  configKey: 'globalImports',
  defaults: { identifiers: defaultIdentifiers },
  setup ({ identifiers }, nuxt) {
    if (nuxt.options.dev) {
      // Add all imports to globalThis in development mode
      addPluginTemplate({
        filename: 'global-imports.mjs',
        src: '',
        getContents: () => {
          const imports = toImports(Object.entries(identifiers))
          const globalThisSet = Object.keys(identifiers).map(name => `globalThis.${name} = ${name};`).join('\n')
          return `${imports}\n\n${globalThisSet}\n\nexport default () => {};`
        }
      })
    } else {
      // Transform to inject imports in production mode
      addVitePlugin(TransformPlugin.vite(identifiers))
      addWebpackPlugin(TransformPlugin.webpack(identifiers))
    }

    // Add types
    const resolved = {}
    const r = id => resolved[id] || (resolved[id] = resolveAlias(id, nuxt.options.alias))

    addTemplate({
      filename: 'global-imports.d.ts',
      write: true,
      getContents: () => `// Generated by global imports
declare global {
${Object.entries(identifiers).map(([api, moduleName]) => `  const ${api}: typeof import('${r(moduleName)}')['${api}']`).join('\n')}
}\nexport {}`
    })
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve(nuxt.options.buildDir, 'global-imports.d.ts') })
    })
  }
})

function toImports (identifiers: Identifiers) {
  const map: Record<string, Set<string>> = {}

  identifiers.forEach(([name, moduleName]) => {
    if (!map[moduleName]) {
      map[moduleName] = new Set()
    }
    map[moduleName].add(name)
  })

  return Object.entries(map)
    .map(([name, imports]) => `import { ${Array.from(imports).join(', ')} } from '${name}';`)
    .join('\n')
}
