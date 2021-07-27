import { Identifiers } from './types'

export function toImports (identifiers: Identifiers) {
  const map: Record<string, Set<string>> = {}

  identifiers.forEach(([name, moduleName]) => {
    if (!map[moduleName]) {
      map[moduleName] = new Set()
    }
    map[moduleName].add(name)
  })

  return Object.entries(map)
    .map(([name, imports]) => `import { ${Array.from(imports).join(', ')} } from '${name}';`)
    .join('')
}
