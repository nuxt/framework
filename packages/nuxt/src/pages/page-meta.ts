import { pathToFileURL } from 'node:url'
import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL, withQuery } from 'ufo'
import { findStaticImports, findExports, StaticImport, parseStaticImport } from 'mlly'
import type { CallExpression, Expression } from 'estree'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { isAbsolute } from 'pathe'

export interface PageMetaPluginOptions {
  dirs: Array<string | RegExp>
  dev?: boolean
  sourcemap?: boolean
}

export const PageMetaPlugin = createUnplugin((options: PageMetaPluginOptions) => {
  return {
    name: 'nuxt:pages-macros-transform',
    enforce: 'post',
    transformInclude (id) {
      return options.dirs.some(dir => typeof dir === 'string' ? id.startsWith(dir) : dir.test(id))
    },
    transform (code, id) {
      const s = new MagicString(code)
      const { search } = parseURL(decodeURIComponent(pathToFileURL(id).href))

      function result () {
        if (s.hasChanged()) {
          return {
            code: s.toString(),
            map: options.sourcemap
              ? s.generateMap({ source: id, includeContent: true })
              : undefined
          }
        }
      }

      const macroMatch = code.match(/\bdefinePageMeta\s*\(\s*/)

      // Remove any references to the macro from our pages
      if (!parseQuery(search).macro) {
        if (macroMatch) {
          walk(this.parse(code), {
            enter (_node) {
              if (_node.type !== 'CallExpression' || (_node as CallExpression).callee.type !== 'Identifier') { return }
              const node = _node as CallExpression & { start: number, end: number }
              const name = 'name' in node.callee && node.callee.name
              if (name === 'definePageMeta') {
                s.overwrite(node.start, node.end, 'false && {}')
              }
            }
          })
        }
        return result()
      }

      const imports = findStaticImports(code)

      // [webpack] Re-export any imports from script blocks in the components
      // with workaround for vue-loader bug: https://github.com/vuejs/vue-loader/pull/1911
      const scriptImport = imports.find(i => parseQuery(i.specifier.replace('?macro=true', '')).type === 'script')
      if (scriptImport) {
        // https://github.com/vuejs/vue-loader/pull/1911
        // https://github.com/vitejs/vite/issues/8473
        const url = isAbsolute(scriptImport.specifier) ? pathToFileURL(scriptImport.specifier).href : scriptImport.specifier
        const parsed = parseURL(decodeURIComponent(url).replace('?macro=true', ''))
        const specifier = withQuery(parsed.pathname, { macro: 'true', ...parseQuery(parsed.search) })
        s.overwrite(0, code.length, `export { default } from "${specifier}"`)
        return result()
      }

      if (!macroMatch && !code.includes('export { default }') && !code.includes('__nuxt_page_meta')) {
        s.overwrite(0, code.length, 'export default {}')
        return result()
      }

      const currentExports = findExports(code)
      for (const match of currentExports) {
        if (match.type !== 'default') {
          continue
        }
        if (match.specifier && match._type === 'named') {
          s.overwrite(0, code.length, `export { default } from "${match.specifier}"`)
          return result()
        }
      }

      const importMap = new Map<string, StaticImport>()
      for (const i of findStaticImports(code)) {
        const parsed = parseStaticImport(i)
        for (const name of [
          parsed.defaultImport,
          ...Object.keys(parsed.namedImports || {}),
          parsed.namespacedImport
        ].filter(Boolean) as string[]) {
          importMap.set(name, i)
        }
      }

      walk(this.parse(code), {
        enter (_node) {
          if (_node.type !== 'CallExpression' || (_node as CallExpression).callee.type !== 'Identifier') { return }
          const node = _node as CallExpression & { start: number, end: number }
          const name = 'name' in node.callee && node.callee.name
          if (name !== 'definePageMeta') { return }

          const meta = node.arguments[0] as Expression & { start: number, end: number }

          let contents = `const __nuxt_page_meta = ${code!.slice(meta.start, meta.end) || '{}'}\nexport default __nuxt_page_meta`

          walk(meta, {
            enter (_node) {
              if (_node.type === 'CallExpression') {
                const node = _node as CallExpression & { start: number, end: number }
                const name = 'name' in node.callee && node.callee.name
                if (name && importMap.has(name)) {
                  contents = importMap.get(name)!.code + '\n' + contents
                }
              }
            }
          })

          s.overwrite(0, code.length, contents)
        }
      })

      if (!s.hasChanged() && !code.includes('__nuxt_page_meta')) {
        s.overwrite(0, code.length, 'export default {}')
      }

      return result()
    }
  }
})
