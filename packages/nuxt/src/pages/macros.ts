import { pathToFileURL } from 'node:url'
import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL, withQuery } from 'ufo'
import { findStaticImports, findExports } from 'mlly'
import MagicString from 'magic-string'

export interface TransformMacroPluginOptions {
  macros: Record<string, string>
  dev?: boolean
}

export const TransformMacroPlugin = createUnplugin((options: TransformMacroPluginOptions) => {
  return {
    name: 'nuxt:pages-macros-transform',
    enforce: 'post',
    transformInclude (id) {
      if (!id || id.startsWith('\x00')) { return }
      const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      return pathname.endsWith('.vue') || !!parseQuery(search).macro
    },
    transform (code, id) {
      const s = new MagicString(code)
      const { search } = parseURL(decodeURIComponent(pathToFileURL(id).href))

      function result () {
        if (s.hasChanged()) {
          return { code: s.toString(), map: s.generateMap({ source: id, includeContent: true }) }
        }
      }

      // Tree-shake out any runtime references to the macro.
      // We do this first as it applies to all files, not just those with the query
      for (const macro in options.macros) {
        const match = code.match(new RegExp(`\\b${macro}\\s*\\(\\s*`))
        if (match?.[0]) {
          s.overwrite(match.index, match.index + match[0].length, `/*#__PURE__*/ false && ${match[0]}`)
        }
      }

      if (!parseQuery(search).macro) {
        return result()
      }

      // [webpack] Re-export any imports from script blocks in the components
      // with workaround for vue-loader bug: https://github.com/vuejs/vue-loader/pull/1911
      const scriptImport = findStaticImports(code).find(i => parseQuery(i.specifier.replace('?macro=true', '')).type === 'script')
      if (scriptImport) {
        const specifier = withQuery(scriptImport.specifier.replace('?macro=true', ''), { macro: 'true' })
        s.overwrite(0, code.length, `export { meta } from "${specifier}"`)
        return result()
      }

      const currentExports = findExports(code)
      for (const match of currentExports) {
        if (match.type !== 'default') {
          continue
        }
        if (match.specifier && match._type === 'named') {
          // [webpack] Export named exports rather than the default (component)
          s.overwrite(match.start, match.end, `export {${Object.values(options.macros).join(', ')}} from "${match.specifier}"`)
          return result()
        } else if (!options.dev) {
          // ensure we tree-shake any _other_ default exports out of the macro script
          s.overwrite(match.start, match.end, '/*#__PURE__*/ false &&')
          s.append('\nexport default {}')
        }
      }

      for (const macro in options.macros) {
        // Skip already-processed macros
        if (currentExports.some(e => e.name === options.macros[macro])) {
          continue
        }

        const { 0: match, index = 0 } = code.match(new RegExp(`\\b${macro}\\s*\\(\\s*`)) || {} as RegExpMatchArray
        const macroContent = match ? extractObject(code.slice(index + match.length)) : 'undefined'

        s.append(`\nexport const ${options.macros[macro]} = ${macroContent}`)
      }

      return result()
    }
  }
})

const starts = {
  '{': '}',
  '[': ']',
  '(': ')',
  '<': '>',
  '"': '"',
  "'": "'"
}

function extractObject (code: string) {
  // Strip comments
  code = code.replace(/^\s*\/\/.*$/gm, '')

  const stack = []
  let result = ''
  do {
    if (stack[0] === code[0] && result.slice(-1) !== '\\') {
      stack.shift()
    } else if (code[0] in starts) {
      stack.unshift(starts[code[0]])
    }
    result += code[0]
    code = code.slice(1)
  } while (stack.length && code.length)
  return result
}
