import { writeFile } from 'fs/promises'
import defu from 'defu'
import { applyDefaults } from 'untyped'
import { useNuxt, nuxtCtx } from '../nuxt'
import type { Nuxt } from '../types/nuxt'
import type { NuxtModule, LegacyNuxtModule, ModuleOptions } from '../types/module'
import { compileTemplate, isNuxt2, templateUtils } from './utils'

/**
 * Define a Nuxt module, automatically merging defaults with user provided options, installing
 * any hooks that are provided, and calling an optional setup function for full control.
 */
export function defineNuxtModule<OptionsT extends ModuleOptions> (input: NuxtModule<OptionsT> | ((nuxt: Nuxt) => NuxtModule<OptionsT>)): LegacyNuxtModule {
  let mod: NuxtModule<OptionsT>

  function wrappedModule (inlineOptions: OptionsT) {
    // Get nuxt context
    const nuxt: Nuxt = this.nuxt || useNuxt()

    // Resolve function
    if (typeof input === 'function') {
      mod = input(nuxt)
    } else {
      mod = input
    }

    // Install hooks
    if (mod.hooks) {
      nuxt.hooks.addHooks(mod.hooks)
    }

    // Stop if no install provided
    if (typeof mod.setup !== 'function') {
      return
    }

    // Resolve options
    const configKey = mod.configKey || mod.name
    const userOptions = defu(inlineOptions, nuxt.options[configKey]) as OptionsT
    const resolvedOptions = applyDefaults(mod.defaults as any, userOptions) as OptionsT

    // Ensure nuxt instance exists (nuxt2 compatibility)
    if (!nuxtCtx.use()) {
      nuxtCtx.set(nuxt)
      // @ts-ignore
      if (!nuxt.__nuxtkit_close__) {
        nuxt.hook('close', () => nuxtCtx.unset())
        // @ts-ignore
        nuxt.__nuxtkit_close__ = true
      }
    }

    if (isNuxt2()) {
      // Support virtual templates with getContents() by writing them to .nuxt directory
      const virtualTemplates = []
      nuxt.hook('builder:prepared', (_builder, buildOptions) => {
        buildOptions.templates.forEach((template, index, arr) => {
          if (!template.getContents) { return }
          // Remove template from template array to handle it ourselves
          arr.splice(index, 1)
          virtualTemplates.push(template)
        })
      })
      nuxt.hook('build:templates', async (templates) => {
        const context = {
          nuxt,
          utils: templateUtils,
          app: {
            dir: nuxt.options.srcDir,
            extensions: nuxt.options.extensions,
            plugins: nuxt.options.plugins,
            templates: templates.templatesFiles
          }
        }
        for await (const template of virtualTemplates) {
          const contents = await compileTemplate({ ...template, src: '' }, context)
          await writeFile(template.dst, contents)
        }
      })
    }

    // Call setup
    return mod.setup.call(null, resolvedOptions, nuxt)
  }

  wrappedModule.meta = mod

  return wrappedModule
}
