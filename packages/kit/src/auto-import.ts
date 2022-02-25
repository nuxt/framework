import { Unimport, Import } from 'unimport'
import { useNuxt } from './context'
import { assertNuxtCompatibility } from './compatibility'

export function addAutoImport (imports: Import | Import[]) {
  assertNuxtCompatibility({ bridge: true })

  useNuxt().hook('autoImports:extend', (ctx: Unimport) => {
    ctx.modifyDynamicImports((dynamicImports) => {
      dynamicImports.push(...(Array.isArray(imports) ? imports : [imports]))
    })
  })
}

export function addAutoImportDir (_autoImportDirs: string | string[]) {
  assertNuxtCompatibility({ bridge: true })

  useNuxt().hook('autoImports:dirs', (autoImportDirs: string[]) => {
    for (const dir of (Array.isArray(_autoImportDirs) ? _autoImportDirs : [_autoImportDirs])) {
      autoImportDirs.push(dir)
    }
  })
}
