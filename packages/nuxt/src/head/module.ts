import { resolve } from 'pathe'
import { addPlugin, defineNuxtModule } from '@nuxt/kit'
import { distDir } from '../dirs'

export default defineNuxtModule({
  meta: {
    name: 'meta'
  },
  setup (options, nuxt) {
    const runtimeDir = nuxt.options.alias['#head'] || resolve(distDir, 'head/runtime')

    // Transpile @nuxt/meta and @vueuse/head
    nuxt.options.build.transpile.push('@vueuse/head')

    // Add #head alias
    nuxt.options.alias['#head'] = runtimeDir

    const componentsPath = resolve(runtimeDir, 'components')
    const headComponents = [
      'Script',
      'NoScript',
      'Link',
      'Base',
      'Title',
      'Meta',
      'Style',
      'Head',
      'Html',
      'Body'
    ].map(c => ({
      // kebab case version of these tags is not valid
      kebabName: c,
      pascalName: c,
      export: c,
      preload: false,
      prefetch: false,
      filePath: componentsPath,
      import: `require(${JSON.stringify(componentsPath)})['${c}']`,
      chunkName: `components/${c}`,
      shortPath: componentsPath
    }))
    nuxt.hook('components:extend', (components) => {
      components.push(...headComponents)
    })

    // Add mixin plugin
    addPlugin({ src: resolve(runtimeDir, 'mixin-plugin') })

    // Add library specific plugin
    addPlugin({ src: resolve(runtimeDir, 'lib/vueuse-head.plugin') })
  }
})
