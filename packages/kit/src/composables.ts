import consola from 'consola'
import { useNuxt } from './context'
import { isNuxt2 } from './compatibility'
import type { AutoImport } from '../../schema/src/types/imports'

export function addComposables (composables: AutoImport | AutoImport[]) {
  const nuxt = useNuxt()

  if (isNuxt2(nuxt)) {
    consola.warn('Composables not available in Nuxt 2')
    return
  }

  nuxt.hook('autoImports:extend', (autoImports: AutoImport[]) => {
    for (const composable of (Array.isArray(composables) ? composables : [composables])) {
      autoImports.push(composable)
    }
  })
}

export function addComposablesDirs (dirs: String | String[]) {
  const nuxt = useNuxt()

  if (isNuxt2(nuxt)) {
    consola.warn('Composables not available in Nuxt 2')
    return
  }

  nuxt.hook('autoImports:dirs', (composablesDirs: String[]) => {
    for (const dir of (Array.isArray(dirs) ? dirs : [dirs])) {
      composablesDirs.push(dir)
    }
  })
}
