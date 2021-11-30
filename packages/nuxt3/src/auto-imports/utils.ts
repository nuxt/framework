import type { AutoImport } from '@nuxt/schema'
import { genExport, genImport } from 'mlly'

export function toImportModuleMap (autoImports: AutoImport[], isCJS = false) {
  const aliasKeyword = isCJS ? ' : ' : ' as '
  const map: Record<string, Set<string>> = {}
  for (const autoImport of autoImports) {
    if (!map[autoImport.from]) {
      map[autoImport.from] = new Set()
    }
    map[autoImport.from].add(
      autoImport.name === autoImport.as
        ? autoImport.name
        : autoImport.name + aliasKeyword + autoImport.as
    )
  }
  return map
}

export function toImports (autoImports: AutoImport[], isCJS = false) {
  const map = toImportModuleMap(autoImports, isCJS)
  if (isCJS) {
    return Object.entries(map)
      .map(([name, imports]) => `const { ${Array.from(imports).join(', ')} } = require(${JSON.stringify(name)});`)
      .join('\n')
  } else {
    return Object.entries(map)
      .map(([name, imports]) => genImport(name, Array.from(imports)))
      .join('\n')
  }
}

export function toExports (autoImports: AutoImport[]) {
  const map = toImportModuleMap(autoImports, false)
  return Object.entries(map)
    .map(([name, imports]) => genExport(name, imports))
    .join('\n')
}

export function filterInPlace<T> (arr: T[], predicate: (v: T) => any) {
  let i = arr.length
  while (i--) {
    if (!predicate(arr[i])) {
      arr.splice(i, 1)
    }
  }
}
