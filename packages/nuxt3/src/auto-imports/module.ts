import { addVitePlugin, addWebpackPlugin, defineNuxtModule, addTemplate, resolveAlias, addPluginTemplate, useNuxt } from '@nuxt/kit'
import type { AutoImportsOptions } from '@nuxt/schema'
import { isAbsolute, join, relative, resolve, normalize } from 'pathe'
import { TransformPlugin } from './transform'
import { Nuxt3AutoImports } from './imports'
import { scanForComposables } from './composables'
import { toImports } from './utils'
import { AutoImportContext, createAutoImportContext, updateAutoImportContext } from './context'

export default defineNuxtModule<AutoImportsOptions>({
  name: 'auto-imports',
  configKey: 'autoImports',
  defaults: {
    sources: Nuxt3AutoImports,
    global: false,
    dirs: [],
    exclude: [/node_modules/]
  },
  async setup (options, nuxt) {
    // Allow modules extending sources
    await nuxt.callHook('autoImports:sources', options.sources)

    // Filter disabled sources
    options.sources = options.sources.filter(source => source.disabled !== true)

    // Create a context to share state between module internals
    const ctx = createAutoImportContext()

    // Add exclude patterns
    ctx.exclude = options.exclude

    // Resolve autoimports from sources
    for (const source of options.sources) {
      for (const importName of source.names) {
        if (typeof importName === 'string') {
          ctx.autoImports.push({ name: importName, as: importName, from: source.from })
        } else {
          ctx.autoImports.push({ name: importName.name, as: importName.as || importName.name, from: source.from })
        }
      }
    }

    // composables/ dirs
    let composablesDirs = [
      join(nuxt.options.srcDir, 'composables'),
      ...options.dirs
    ]
    await nuxt.callHook('autoImports:dirs', composablesDirs)
    composablesDirs = composablesDirs.map(dir => normalize(dir))

    // Transpile and injection
    // @ts-ignore temporary disabled due to #746
    if (nuxt.options.dev && options.global) {
      // Add all imports to globalThis in development mode
      addPluginTemplate({
        filename: 'auto-imports.mjs',
        src: '',
        getContents: () => {
          const imports = toImports(ctx.autoImports)
          const globalThisSet = ctx.autoImports.map(i => `globalThis.${i.as} = ${i.as};`).join('\n')
          return `${imports}\n\n${globalThisSet}\n\nexport default () => {};`
        }
      })
    } else {
      // Transform to inject imports in production mode
      addVitePlugin(TransformPlugin.vite(ctx))
      addWebpackPlugin(TransformPlugin.webpack(ctx))
    }

    const updateAutoImports = async () => {
      // Scan composables/
      for (const composablesDir of composablesDirs) {
        await scanForComposables(composablesDir, ctx.autoImports)
      }
      // Allow modules extending
      await nuxt.callHook('autoImports:extend', ctx.autoImports)
      // Update context
      updateAutoImportContext(ctx)
      // Generate types
      generateDts(ctx)
    }
    await updateAutoImports()

    // Add generated types to `nuxt.d.ts`
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve(nuxt.options.buildDir, 'auto-imports.d.ts') })
    })

    // Watch composables/ directory
    nuxt.hook('builder:watch', async (_, path) => {
      const _resolved = resolve(nuxt.options.srcDir, path)
      if (composablesDirs.find(dir => _resolved.startsWith(dir))) {
        await updateAutoImports()
      }
    })
  }
})

function generateDts (ctx: AutoImportContext) {
  const nuxt = useNuxt()

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
${ctx.autoImports.map(i => `  const ${i.as}: typeof import('${r(i.from)}')['${i.name}']`).join('\n')}
}

export {}
`
  })
}
