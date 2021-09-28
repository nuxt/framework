import { mkdir, writeFile } from 'fs/promises'
import defu from 'defu'
import { applyDefaults } from 'untyped'
import { join } from 'pathe'
import { useNuxt, nuxtCtx } from '../nuxt'
import type { Nuxt, NuxtTemplate } from '../types/nuxt'
import type { NuxtModule, LegacyNuxtModule, ModuleOptions } from '../types/module'
import { compileTemplate, isNuxt2 } from './utils'

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
      // Support virtual templates with getContents() by writing dummy output file
      const templateDir = join(nuxt.options.buildDir, 'templates')
      async function writeTemplateFiles (templates: NuxtTemplate[], context?: Record<string, any>) {
        await mkdir(templateDir, { recursive: true })
        await Promise.all(templates.map(async (template) => {
          const getContents = template.getContents || template.options?.getContents
          if (!getContents) { return }

          // Create a dummy output file to hold compiled template contents
          template.src = template.src || join(templateDir, template.filename)

          // Write an empty output file if this is at the builder:prepared stage
          // as Nuxt relies on the file existing.
          const contents = context ? await compileTemplate({ ...template, src: '', getContents }, context) : ''
          await writeFile(template.src, contents)

          // Inject getContents in options for later re-compiling
          template.options = {
            getContents,
            ...template.options
          }
        }))
      }
      nuxt.hook('builder:prepared', async (_builder, buildOptions) => {
        await mkdir(templateDir, { recursive: true })
        await writeTemplateFiles(buildOptions.templates)
      })
      nuxt.hook('build:templates', async (templates) => {
        await writeTemplateFiles(templates.templatesFiles, templates.templateVars)
      })
    }

    // Call setup
    return mod.setup.call(null, resolvedOptions, nuxt)
  }

  wrappedModule.meta = mod

  return wrappedModule
}
