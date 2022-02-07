import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { useNuxt } from '../context'
import { resolveModule, requireModule, importModule } from '../internal/cjs'
import { resolveAlias } from '../resolve'
import { useModuleContainer } from './container'

async function normalizeModule (nuxtModule: string | NuxtModule, inlineOptions?: any) {
  const nuxt = useNuxt()

  // Detect if `installModule` used with older signuture (nuxt, nuxtModule)
  // TODO: Remove in RC
  // @ts-ignore
  if (nuxtModule?._version || nuxtModule?.version || nuxtModule?.constructor?.version || '') {
    [nuxtModule, inlineOptions] = [inlineOptions, {}]
    console.warn(new Error('`installModule` is being called with old signature!'))
  }

  // Import if input is string
  if (typeof nuxtModule === 'string') {
    const _src = resolveModule(resolveAlias(nuxtModule, nuxt.options.alias), { paths: nuxt.options.modulesDir })
    // TODO: also check with type: 'module' in closest `package.json`
    const isESM = _src.endsWith('.mjs')
    nuxtModule = isESM ? await importModule(_src) : requireModule(_src)
  }

  // Throw error if input is not a function
  if (typeof nuxtModule !== 'function') {
    throw new TypeError('Nuxt module should be a function: ' + nuxtModule)
  }

  return [nuxtModule, inlineOptions] as [NuxtModule<any>, undefined | Record<string, any>]
}

/** Installs a module on a Nuxt instance. */
export async function installModule (moduleToInstall: string | NuxtModule, inlineOptions?: any, _nuxt?: Nuxt) {
  const nuxt = useNuxt()
  const [nuxtModule, options] = await normalizeModule(moduleToInstall, inlineOptions)

  // Call module
  await nuxtModule.call(useModuleContainer(), options, nuxt)

  nuxt.options._installedModules = nuxt.options._installedModules || []
  nuxt.options._installedModules.push({
    meta: await nuxtModule.getMeta?.(),
    entryPath: typeof moduleToInstall === 'string' ? resolveAlias(moduleToInstall, nuxt.options.alias) : undefined
  })
}
