import { AutoImport } from '@nuxt/kit'

export interface AutoImportContext {
  autoImports: AutoImport[]
  matchRE: RegExp
  map: Map<string, AutoImport>
}

export function updateAutoImportContext (ctx: AutoImportContext) {
  ctx.matchRE = new RegExp(`\\b(${ctx.autoImports.map(i => i.as).join('|')})\\b`, 'g')
  ctx.map.clear()

  for (const autoImport of ctx.autoImports) {
    ctx.map.set(autoImport.as, autoImport)
  }

  return ctx
}
