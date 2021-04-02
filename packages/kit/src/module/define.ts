import defu from 'defu'
import { applyDefaults } from 'untyped'
import { useNuxt, nuxtCtx } from '../nuxt'
import type { Nuxt } from '../types/nuxt'
import type { NuxtModule, LegacyNuxtModule, ModuleOptions } from '../types/module'

export function defineNuxtModule<OptionsT extends ModuleOptions> (m: NuxtModule<OptionsT> | ((nuxt: Nuxt) => NuxtModule<OptionsT>)): LegacyNuxtModule {
  function wrappedModule (inlineOptions: OptionsT) {
    // Get nuxt context
    const nuxt: Nuxt = this.nuxt || useNuxt()

    // Resolve function
    if (typeof m === 'function') {
      m = m(nuxt)
    }

    // Install hooks
    if (m.hooks) {
      nuxt.hooks.addHooks(m.hooks)
    }

    // Stop if no install provided
    if (typeof m.install !== 'function') {
      return
    }

    // Resolve options
    const configKey = m.configKey || m.name
    const userOptions = defu(inlineOptions, nuxt.options[configKey]) as OptionsT
    const resolvedOptions = applyDefaults(m.defaults as any, userOptions) as OptionsT

    // Call install
    return nuxtCtx.call(nuxt, () => m.install.call(null, resolvedOptions, nuxt))
  }

  wrappedModule.meta = m

  return wrappedModule
}
