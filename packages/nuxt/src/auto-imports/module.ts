import { addVitePlugin, addWebpackPlugin, defineNuxtModule, addTemplate, resolveAlias, useNuxt, addPluginTemplate, logger } from '@nuxt/kit'
import { isAbsolute, join, relative, resolve, normalize } from 'pathe'
import { createUnimport, Import, toImports, Unimport } from 'unimport'
import { AutoImportsOptions, ImportPresetWithDeprecation } from '@nuxt/schema'
import { TransformPlugin } from './transform'
import { defaultPresets } from './presets'
import { scanForComposables } from './composables'

export default defineNuxtModule<Partial<AutoImportsOptions>>({
  meta: {
    name: 'auto-imports',
    configKey: 'autoImports'
  },
  defaults: {
    presets: defaultPresets,
    global: false,
    imports: [],
    dirs: [],
    transform: {
      exclude: undefined
    }
  },
  async setup (options, nuxt) {
    // Allow modules extending sources
    await nuxt.callHook('autoImports:sources', options.presets as ImportPresetWithDeprecation[])

    options.presets.forEach((i: ImportPresetWithDeprecation) => {
      if (typeof i !== 'string' && i.names && !i.imports) {
        i.imports = i.names
        logger.warn('auto-imports: presets.names is deprecated, use presets.imports instead')
      }
    })

    // Filter disabled sources
    // options.sources = options.sources.filter(source => source.disabled !== true)

    // Create a context to share state between module internals
    const ctx = createUnimport({
      presets: options.presets,
      imports: options.imports
    })

    // composables/ dirs from all layers
    let composablesDirs = []
    for (const layer of nuxt.options._layers) {
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
      getContents: () => ctx.toExports()
    })
    nuxt.options.alias['#imports'] = join(nuxt.options.buildDir, 'imports')

    // Transpile and injection
    // @ts-ignore temporary disabled due to #746
    if (nuxt.options.dev && options.global) {
      // Add all imports to globalThis in development mode
      addPluginTemplate({
        filename: 'auto-imports.mjs',
        getContents: () => {
          const imports = ctx.getImports()
          const importStatement = toImports(imports)
          const globalThisSet = imports.map(i => `globalThis.${i.as} = ${i.as};`).join('\n')
          return `${importStatement}\n\n${globalThisSet}\n\nexport default () => {};`
        }
      })
    } else {
      // Transform to inject imports in production mode
      addVitePlugin(TransformPlugin.vite({ ctx, options, sourcemap: nuxt.options.dev }))
      addWebpackPlugin(TransformPlugin.webpack({ ctx, options, sourcemap: nuxt.options.dev }))
    }

    const regenerateAutoImports = async () => {
      // Scan composables/
      await scanForComposables(composablesDirs, ctx)
      // Allow modules extending
      await ctx.modifyDynamicImports(async (imports) => {
        await nuxt.callHook('autoImports:extend', imports)
      })
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

function addDeclarationTemplates (ctx: Unimport) {
  const nuxt = useNuxt()

  // Remove file extension for benefit of TypeScript
  const stripExtension = (path: string) => path.replace(/\.[a-z]+$/, '')

  const resolved = {}
  const r = ({ from }: Import) => {
    if (resolved[from]) {
      return resolved[from]
    }
    let path = resolveAlias(from)
    if (isAbsolute(path)) {
      path = relative(join(nuxt.options.buildDir, 'types'), path)
    }

    path = stripExtension(path)
    resolved[from] = path
    return path
  }

  addTemplate({
    filename: 'imports.d.ts',
    getContents: () => ctx.toExports()
  })

  addTemplate({
    filename: 'types/auto-imports.d.ts',
    getContents: () => '// Generated by auto imports\n' + ctx.generateTypeDecarations({ resolvePath: r })
  })
}
