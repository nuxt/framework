import { addVitePlugin, addWebpackPlugin, defineNuxtModule, addTemplate, resolveAlias, addPluginTemplate } from '@nuxt/kit'
import { isAbsolute, join, relative, resolve } from 'pathe'
import type { AutoImportsOptions } from './types'
import { TransformPlugin } from './transform'
import { defaultIdentifiers } from './identifiers'
import { scanForComposables } from './composables'
import { toImports } from './utils'

export default defineNuxtModule<AutoImportsOptions>({
  name: 'auto-imports',
  configKey: 'autoImports',
  defaults: { identifiers: defaultIdentifiers },
  async setup ({ disabled = [], identifiers }, nuxt) {
    for (const key of disabled) {
      delete identifiers[key]
    }

    const composablesDir = join(nuxt.options.rootDir, 'composables')
    await scanForComposables(composablesDir, identifiers)

    nuxt.hook('builder:watch', async (_, path) => {
      if (resolve(nuxt.options.rootDir, path).startsWith(composablesDir)) {
        await scanForComposables(composablesDir, identifiers)
        updateDTS()
      }
    })

    // temporary disable #746
    // eslint-disable-next-line no-constant-condition
    if (nuxt.options.dev && false) {
      // Add all imports to globalThis in development mode
      addPluginTemplate({
        filename: 'auto-imports.mjs',
        src: '',
        getContents: () => {
          const imports = toImports(identifiers, Object.keys(identifiers))
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

    updateDTS()

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve(nuxt.options.buildDir, 'auto-imports.d.ts') })
    })

    function updateDTS () {
      addTemplate({
        filename: 'auto-imports.d.ts',
        write: true,
        getContents: () => `// Generated by auto imports
declare global {
${Object.entries(identifiers).map(([api, meta]) => `  const ${api}: typeof import('${r(typeof meta === 'string' ? meta : meta.from)}')['${api}']`).join('\n')}
}\nexport {}`
      })
    }
  }
})
