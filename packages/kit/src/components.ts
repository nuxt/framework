import { pascalCase, kebabCase } from 'scule'
import type { ComponentsDir, Component } from '@nuxt/schema'
import { genDynamicImport } from 'knitwork'
import { useNuxt } from './context'
import { assertNuxtCompatibility } from './compatibility'

/**
 * Register a directory to be scanned for components and imported only when used.
 *
 * Requires Nuxt 2.13+
 */
export async function addComponentsDir (dir: ComponentsDir) {
  const nuxt = useNuxt()
  await assertNuxtCompatibility({ nuxt: '>=2.13' }, nuxt)
  nuxt.options.components = nuxt.options.components || []
  nuxt.hook('components:dirs', (dirs) => { dirs.push(dir) })
}

export type AddComponentOptions = { name: string, filePath: string } & Partial<Exclude<Component,
'shortPath' | 'async' | 'level' | 'import' | 'asyncImport'
>>

/**
 * Register a directory to be scanned for components and imported only when used.
 *
 * Requires Nuxt 2.13+
 */
export async function addComponent (opts: AddComponentOptions) {
  const nuxt = useNuxt()
  await assertNuxtCompatibility({ nuxt: '>=2.13' }, nuxt)
  nuxt.options.components = nuxt.options.components || []

  // Apply defaults
  const component: Component = {
    export: opts.export || 'default',
    chunkName: 'components/' + kebabCase(opts.name),
    global: opts.global ?? false,
    kebabName: kebabCase(opts.name || ''),
    pascalName: pascalCase(opts.name || ''),
    prefetch: false,
    preload: false,
    mode: 'all',

    // Nuxt 2 support
    shortPath: opts.filePath,
    async: false,
    level: 0,
    asyncImport: `${genDynamicImport(opts.filePath)}.then(r => r['${opts.export || 'default'}'])`,
    import: `require(${JSON.stringify(opts.filePath)})['${opts.export || 'default'}']`,

    ...opts
  }

  nuxt.hook('components:extend', (components: Component[]) => {
    const existingComponent = components.find(c => c.pascalName === component.pascalName || c.kebabName === component.kebabName)
    if (existingComponent) {
      const name = existingComponent.pascalName || existingComponent.kebabName
      console.warn(`Overriding ${name} component.`)
      Object.assign(existingComponent, component)
    } else {
      components.push(component)
    }
  })
}
