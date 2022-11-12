import { pathToFileURL } from 'node:url'
import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import type { CallExpression } from 'estree'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { isAbsolute, join, normalize } from 'pathe'
import { extractMetadata } from './utils'

export const PAGE_META_MODULE_EXT = '.nuxt-page-meta'

export interface PageMetaPluginOptions {
  root: string,
  dirs: Array<string | RegExp>
  dev?: boolean
  sourcemap?: boolean
}

export const PageMetaPlugin = createUnplugin((options: PageMetaPluginOptions) => {
  return {
    name: 'nuxt:pages-macros-transform',
    enforce: 'post',
    resolveId (id) {
      return id.endsWith(PAGE_META_MODULE_EXT) ? id : undefined
    },
    loadInclude (id) {
      return id.endsWith(PAGE_META_MODULE_EXT)
    },
    async load (id) {
      const file = id.slice(0, -PAGE_META_MODULE_EXT.length)
      const filename = file.startsWith(options.root) ? file : join(options.root, file.slice(1))
      return await extractMetadata(filename)
    },
    transformInclude (id) {
      id = normalize(id)

      const isPagesDir = options.dirs.some(dir => typeof dir === 'string' ? id.startsWith(dir) : dir.test(id))
      if (!isPagesDir) { return false }

      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      return /\.(m?[jt]sx?|vue)/.test(pathname)
    },
    // Remove `definePageMeta` in Vue SFC
    transform (code, id) {
      const query = parseMacroQuery(id)
      if (query.type && query.type !== 'script') { return }

      const s = new MagicString(code)
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

      const hasMacro = code.match(/\bdefinePageMeta\s*\(\s*/)

      // Remove any references to the macro from our pages
      if (!query.macro) {
        if (hasMacro) {
          walk(this.parse(code, {
            sourceType: 'module',
            ecmaVersion: 'latest'
          }), {
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
    }
  }
})

function parseMacroQuery (id: string) {
  const { search } = parseURL(decodeURIComponent(isAbsolute(id) ? pathToFileURL(id).href : id).replace(/\?macro=true$/, ''))
  const query = parseQuery(search)
  if (id.includes('?macro=true')) {
    return { macro: 'true', ...query }
  }
  return query
}
