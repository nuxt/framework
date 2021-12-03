import { promises as fsp } from 'fs'
import defu from 'defu'
import { applyDefaults } from 'untyped'
import consola from 'consola'
import { dirname } from 'pathe'
import type { Nuxt, NuxtTemplate, NuxtModule, ModuleOptions, ModuleMeta, ModuleDefinition } from '@nuxt/schema'
import { useNuxt, nuxtCtx } from '../context'
import { isNuxt2, checkNuxtCompatibilityIssues } from '../compatibility'
import { templateUtils, compileTemplate } from '../internal/template'

/**
 * Define a Nuxt module, automatically merging defaults with user provided options, installing
 * any hooks that are provided, and calling an optional setup function for full control.
 */
export function defineNuxtModule<OptionsT extends ModuleOptions> (definition: ModuleDefinition<OptionsT> | ((nuxt: Nuxt) => ModuleDefinition<OptionsT>)): NuxtModule {
  // Resolves input module to optionally init with nuxt
  let _module: ModuleDefinition<OptionsT>
  function useModule () {
    if (_module) { return _module }
    if (typeof definition === 'function') {
      _module = definition(useNuxt())
    } else {
      _module = definition
    }
    return _module
  }

  // Resolves module options from inline options, [configKey] in nuxt.config, defaults and schema
  let _options: OptionsT
  function useModuleOptions (inlineOptions?: OptionsT) {
    if (_options) { return _options }
    const nuxtModule = useModule()
    const nuxt = useNuxt()
    const configKey = nuxtModule.configKey || nuxtModule.name
    _options = defu(inlineOptions, nuxt.options[configKey], nuxtModule.defaults) as OptionsT
    if (nuxtModule.schema) {
      _options = applyDefaults(nuxtModule.schema, _options) as OptionsT
    }
    return _options
  }

  // Resolves module meta
  let _meta: ModuleMeta
  function useModuleMeta () {
    if (_meta) { return _meta }
    const _module = useModule()
    _meta = {
      name: _module.name || _module.configKey,
      version: _module.version,
      configKey: _module.configKey || _module.name,
      requires: _module.requires
    }
    return _meta
  }

  // Module format is always a simple function
  function setupModule (inlineOptions: OptionsT) {
    // Prepare
    const nuxt = useNuxt() || this.nuxt /* nuxt 2 */
    nuxt2Shims(nuxt)

    // Resolve module and options
    const _module = useModule()
    const _options = useModuleOptions(inlineOptions)

    // Register hooks
    nuxt.hooks.addHooks(_module.hooks)

    // Check compatibility contraints
    if (_module.requires) {
      const issues = checkNuxtCompatibilityIssues(_module.requires, nuxt)
      if (issues.length) {
        consola.warn(`Module \`${_module.name}\` is disabled due to incompatibility issues:\n${issues.toString()}`)
        return
      }
    }

    // Call setup
    return _module.setup.call(null, _options, nuxt)
  }

  // Define getters for options and meta
  setupModule.getOptions = useModuleOptions
  setupModule.getMeta = useModuleMeta

  return setupModule as NuxtModule
}

// -- Nuxt2 compatibility shims --
const NUXT2_SHIMS_KEY = '__nuxt2_shims_key__'
function nuxt2Shims (nuxt: Nuxt) {
  // Avoid duplicate install
  if (!isNuxt2(nuxt) || nuxt[NUXT2_SHIMS_KEY]) { return }
  nuxt[NUXT2_SHIMS_KEY] = true

  // Allow using nuxt.hooks
  // @ts-ignore Nuxt 2 extends hookable
  nuxt.hooks = nuxt

  // Allow using useNuxt()
  if (!nuxtCtx.use()) {
    nuxtCtx.set(nuxt)
    nuxt.hook('close', () => nuxtCtx.unset())
  }

  // Support virtual templates with getContents() by writing them to .nuxt directory
  let virtualTemplates: NuxtTemplate[]
  nuxt.hook('builder:prepared', (_builder, buildOptions) => {
    virtualTemplates = buildOptions.templates.filter(t => t.getContents)
    for (const template of virtualTemplates) {
      buildOptions.templates.splice(buildOptions.templates.indexOf(template), 1)
    }
  })
  nuxt.hook('build:templates', async (templates) => {
    const context = {
      nuxt,
      utils: templateUtils,
      app: {
        dir: nuxt.options.srcDir,
        extensions: nuxt.options.extensions,
        plugins: nuxt.options.plugins,
        templates: [
          ...templates.templatesFiles,
          ...virtualTemplates
        ],
        templateVars: templates.templateVars
      }
    }
    for await (const template of virtualTemplates) {
      const contents = await compileTemplate({ ...template, src: '' }, context)
      await fsp.mkdir(dirname(template.dst), { recursive: true })
      await fsp.writeFile(template.dst, contents)
    }
  })
}
