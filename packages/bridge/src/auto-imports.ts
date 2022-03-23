import { installModule, useNuxt } from '@nuxt/kit'
import * as CompositionApi from '@vue/composition-api'
import autoImports from '../../nuxt3/src/auto-imports/module'

const UnsupportedImports = new Set(['useAsyncData', 'useFetch', 'useError', 'throwError', 'clearError'])
const CapiHelpers = new Set(Object.keys(CompositionApi))

export function setupAutoImports () {
  const nuxt = useNuxt()
  nuxt.hook('autoImports:sources', (presets) => {
    for (const preset of presets) {
      if (preset.from === '#app') {
        preset.imports = preset.imports.filter(i => !UnsupportedImports.has(i as string))
        if (!preset.imports.includes('useNuxt2Meta')) {
          preset.imports.push('useNuxt2Meta')
        }
      } else if (preset.from === 'vue') {
        preset.from = '@vue/composition-api'
        preset.imports = preset.imports.filter(i => CapiHelpers.has(i as string))
      }
    }
  })

  nuxt.hook('modules:done', () => installModule(autoImports))
}
