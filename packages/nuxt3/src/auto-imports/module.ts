import { addVitePlugin, addWebpackPlugin, defineNuxtModule, addTemplate, resolveAlias, addPluginTemplate, useNuxt } from '@nuxt/kit'
import type { AutoImportsOptions } from '@nuxt/schema'
import { isAbsolute, join, relative, resolve, normalize } from 'pathe'
import { genDynamicImport } from 'knitwork'
import { TransformPlugin } from './transform'
import { Nuxt3AutoImports } from './imports'
import { scanForComposables } from './composables'
import { toExports, toImports } from './utils'
import { AutoImportContext, createAutoImportContext, updateAutoImportContext } from './context'

export default defineNuxtModule<AutoImportsOptions>({
  meta: {
    name: 'auto-imports',
    configKey: 'autoImports'
  },
  defaults: {
    sources: Nuxt3AutoImports,
    global: false,
    dirs: [],
    transform: {
      exclude: undefined
    }
  },
  async setup (options, nuxt) {
    // Allow modules extending sources
    await nuxt.callHook('autoImports:sources', options.sources)

    // Filter disabled sources
    options.sources = options.sources.filter(source => source.disabled !== true)

    // Create a context to share state between module internals
    const ctx = createAutoImportContext(options)

    // composables/ dirs
    let composablesDirs = [
      join(nuxt.options.srcDir, 'composables'),
      ...options.dirs
    ]

    // Extend with layers
    for (const layer of nuxt.options._extends) {
      composablesDirs.push(resolve(layer.config.srcDir, 'composables'))
      for (const dir of (layer.config.autoImports?.dirs ?? [])) {
        composablesDirs.push(resolve(layer.config.srcDir, dir))
      }
    }

    await nuxt.callHook('autoImports:dirs', composablesDirs)
    composablesDirs = composablesDirs.map(dir => normalize(dir))

    // Support for importing from '#imports'
    addTemplate({
      filename: 'imports.mjs',
      getContents: () => toExports(ctx.autoImports)
    })
    nuxt.options.alias['#imports'] = join(nuxt.options.buildDir, 'imports')

    // Transpile and injection
    // @ts-ignore temporary disabled due to #746
    if (nuxt.options.dev && options.global) {
      // Add all imports to globalThis in development mode
      addPluginTemplate({
        filename: 'auto-imports.mjs',
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

    const regenerateAutoImports = async () => {
      // Resolve autoimports from sources
      ctx.autoImports = options.sources.flatMap(source => source.names.map(
        importName => typeof importName === 'string'
          ? { name: importName, as: importName, from: source.from }
          : { name: importName.name, as: importName.as || importName.name, from: source.from }
      ))
      // Scan composables/
      await scanForComposables(composablesDirs, ctx.autoImports)
      // Allow modules extending
      await nuxt.callHook('autoImports:extend', ctx.autoImports)
      // Update context
      updateAutoImportContext(ctx)
    }

    await regenerateAutoImports()

    // Generate types
    addDeclarationTemplates(ctx)

    // Add generated types to `nuxt.d.ts`
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve(nuxt.options.buildDir, 'types/auto-imports.d.ts') })
      references.push({ path: resolve(nuxt.options.buildDir, 'imports.d.ts') })
    })

    // Watch composables/ directory
    nuxt.hook('builder:watch', async (_, path) => {
      const _resolved = resolve(nuxt.options.srcDir, path)
      if (composablesDirs.find(dir => _resolved.startsWith(dir))) {
        await nuxt.callHook('builder:generateApp')
      }
    })

    nuxt.hook('builder:generateApp', async () => {
      await regenerateAutoImports()
    })
  }
})

function addDeclarationTemplates (ctx: AutoImportContext) {
  const nuxt = useNuxt()

  // Remove file extension for benefit of TypeScript
  const stripExtension = (path: string) => path.replace(/\.[a-z]+$/, '')

  const resolved = {}
  const r = (id: string) => {
    if (resolved[id]) { return resolved[id] }
    let path = resolveAlias(id)
    if (isAbsolute(path)) {
      path = relative(join(nuxt.options.buildDir, 'types'), path)
    }
    path = stripExtension(path)
    resolved[id] = path
    return path
  }

  addTemplate({
    filename: 'imports.d.ts',
    getContents: () => toExports(ctx.autoImports.map(i => ({ ...i, from: stripExtension(i.from) })))
  })

  addTemplate({
    filename: 'types/auto-imports.d.ts',
    getContents: () => `// Generated by auto imports
declare global {
${ctx.autoImports.map(i => `  const ${i.as}: typeof ${genDynamicImport(r(i.from), { wrapper: false })}['${i.name}']`).join('\n')}
}

export {}
`
  })
}
