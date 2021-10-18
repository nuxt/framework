import { addVitePlugin, addWebpackPlugin, defineNuxtModule, addTemplate, resolveAlias, addPluginTemplate, AutoImport } from '@nuxt/kit'
import type { AutoImportsOptions } from '@nuxt/kit'
import { isAbsolute, relative, resolve } from 'pathe'
import { TransformPlugin } from './transform'
import { Nuxt3AutoImports } from './imports'

export default defineNuxtModule<AutoImportsOptions>({
  name: 'auto-imports',
  configKey: 'autoImports',
  defaults: {
    sources: Nuxt3AutoImports,
    global: false
  },
  async setup (options, nuxt) {
    // Allow modules extending sources
    await nuxt.callHook('imports:sources', options.sources)

    // Filter disabled sources
    options.sources = options.sources.filter(source => source.disabled !== true)

    // Resolve autoimports from sources
    let autoImports: AutoImport[] = []
    for (const source of options.sources) {
      for (const importName of source.names) {
        if (typeof importName === 'string') {
          autoImports.push({ name: importName, as: importName, from: source.from })
        } else {
          autoImports.push({ name: importName.name, as: importName.as || importName.name, from: source.from })
        }
      }
    }

    // Allow modules extending resolved imports
    await nuxt.callHook('imports:extend', autoImports)

    // Filter disabled imports
    autoImports = autoImports.filter(i => i.disabled !== true)

    // temporary disable #746
    // @ts-ignore
    if (nuxt.options.dev && options.global) {
      // Add all imports to globalThis in development mode
      addPluginTemplate({
        filename: 'auto-imports.mjs',
        src: '',
        getContents: () => {
          const imports = toImports(autoImports)
          const globalThisSet = autoImports.map(i => `globalThis.${i.as} = ${i.as};`).join('\n')
          return `${imports}\n\n${globalThisSet}\n\nexport default () => {};`
        }
      })
    } else {
      // Transform to inject imports in production mode
      addVitePlugin(TransformPlugin.vite(autoImports))
      addWebpackPlugin(TransformPlugin.webpack(autoImports))
    }

    // Add types
    const resolved = {}
    const r = (id: string) => {
      if (resolved[id]) { return resolved[id] }
      let path = resolveAlias(id, nuxt.options.alias)
      if (isAbsolute(path)) {
        path = relative(nuxt.options.buildDir, path)
      }
      // Remove file extension for benefit of TypeScript
      path = path.replace(/\.[a-z]+$/, '')
      resolved[id] = path
      return path
    }

    addTemplate({
      filename: 'auto-imports.d.ts',
      write: true,
      getContents: () => `// Generated by auto imports
declare global {
${autoImports.map(i => `  const ${i.as}: typeof import('${r(i.as)}')['${i.name}']`).join('\n')}
}\nexport {}`
    })
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve(nuxt.options.buildDir, 'auto-imports.d.ts') })
    })
  }
})

function toImports (autoImports: AutoImport[]) {
  const map: Record<string, Set<string>> = {}
  for (const autoImport of autoImports) {
    if (!map[autoImport.from]) {
      map[autoImport.from] = new Set()
    }
    map[autoImport.from].add(autoImport.as)
  }
  return Object.entries(map)
    .map(([name, imports]) => `import { ${Array.from(imports).join(', ')} } from '${name}';`)
    .join('\n')
}
