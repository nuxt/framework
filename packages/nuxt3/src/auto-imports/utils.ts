import { IdentifierMap, IdentifierMeta } from './types'

export function toImports (identifiers: IdentifierMap, names: string[], cjs = false) {
  const fromMap: Record<string, [string, IdentifierMeta][]> = {}

  // group by module name
  names.forEach((name) => {
    const meta = identifiers[name]
    const from = typeof meta === 'string' ? meta : meta.from
    if (!fromMap[from]) {
      fromMap[from] = []
    }
    fromMap[from].push([name, meta])
  })

  if (cjs) {
    return Object.entries(fromMap)
      .map(([moduleName, names]) => {
        const imports = names.map(([name, meta]) => {
          if (typeof meta !== 'string' && meta.name) {
            return meta.name + ' : ' + name
          }
          return name
        })
        return `const { ${imports.join(',')} } = require('${moduleName}');`
      })
      .join('')
  } else {
    return Object.entries(fromMap)
      .map(([from, names]) => {
        const imports = names.map(([name, meta]) => {
          if (typeof meta !== 'string' && meta.name) {
            return meta.name + ' as ' + name
          }
          return name
        })
        return `import { ${imports.join(',')} } from '${from}';`
      })
      .join('')
  }
}
