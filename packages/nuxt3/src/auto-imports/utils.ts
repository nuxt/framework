import consola from 'consola'
import { IdentifierMap, IdentifierInfo } from './types'

export function toImports (identifiers: IdentifierMap, names: string[], cjs = false) {
  const fromMap: Record<string, [string, IdentifierInfo][]> = {}

  // group by module name
  names.forEach((name) => {
    const info = identifiers[name]
    const from = info.from
    if (!fromMap[from]) {
      fromMap[from] = []
    }
    fromMap[from].push([name, info])
  })

  if (cjs) {
    return Object.entries(fromMap)
      .map(([moduleName, names]) => {
        const imports = names.map(([name, info]) => {
          if (info.name && info.name !== name) {
            return info.name + ' : ' + name
          }
          return name
        })
        return `const { ${imports.join(',')} } = require('${moduleName}');`
      })
      .join('')
  } else {
    return Object.entries(fromMap)
      .map(([from, names]) => {
        const imports = names.map(([name, info]) => {
          if (info.name && info.name !== name) {
            return info.name + ' as ' + name
          }
          return name
        })
        return `import { ${imports.join(',')} } from '${from}';`
      })
      .join('')
  }
}

export function updateIdentifier (identifier: IdentifierMap, name: string, info: IdentifierInfo) {
  if (identifier[name] && identifier[name].from !== info.from) {
    consola.warn('[auto-imports] import name `' + name + '` from `' + identifier[name].from + '` conflicted with `' + info.from + '`')
  }
  identifier[name] = info
}
