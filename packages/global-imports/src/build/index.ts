import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import { IdentifierMap } from '../types'

export const BuildPlugin = createUnplugin((map: IdentifierMap) => {
  const regex = new RegExp('\\b(' + (Object.keys(map).join('|')) + ')\\b', 'g')

  return {
    name: 'nuxt-global-imports-build',
    enforce: 'post',
    transformInclude (id) {
      const { pathname, search } = parseURL(id)
      const query = parseQuery(search)

      // vue files
      if (pathname.endsWith('.vue') && (query.type === 'template' || !search)) {
        return true
      }

      // js files
      if (pathname.match(/\.((c|m)?j|t)sx?/g)) {
        return true
      }
    },
    transform (code) {
      // find all possible injection
      const matched = new Set(Array.from(code.matchAll(regex)).map(i => i[1]))

      // remove those already imported
      Array.from(code.matchAll(/\bimport\s*\{([\s\S]*?)\}\s*from\b/g))
        .flatMap(i => i[1]?.split(',') || [])
        .forEach(i => matched.delete(i.trim()))

      // TODO: group by module name
      const imports = Array.from(matched).map((name) => {
        const moduleName = map[name]!
        return `import { ${name} } from '${moduleName}';`
      }).join('')

      return imports + code
    }
  }
})
