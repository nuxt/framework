import { pathToFileURL } from 'node:url'
import { createUnplugin } from 'unplugin'
import { isAbsolute, relative } from 'pathe'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { hash } from 'ohash'
import type { CallExpression } from 'estree'
import { parseQuery, parseURL } from 'ufo'

export interface ComposableKeysOptions {
  sourcemap: boolean
  rootDir: string
}

const keyedFunctions = [
  'useState', 'useFetch', 'useAsyncData', 'useLazyAsyncData', 'useLazyFetch'
]
const KEYED_FUNCTIONS_RE = new RegExp(`(${keyedFunctions.join('|')})`)

export const composableKeysPlugin = createUnplugin((options: ComposableKeysOptions) => {
  return {
    name: 'nuxt:composable-keys',
    enforce: 'post',
    transform (code, id) {
      const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      if (!pathname.match(/\.(m?[jt]sx?|vue)/) || parseQuery(search).type === 'style') { return }
      if (!KEYED_FUNCTIONS_RE.test(code)) { return }
      const { 0: script = code, index: codeIndex = 0 } = code.match(/(?<=<script[^>]*>)[\S\s.]*?(?=<\/script>)/) || []
      const s = new MagicString(code)
      // https://github.com/unjs/unplugin/issues/90
      let count = 0
      const relativeID = isAbsolute(id) ? relative(options.rootDir, id) : id
      walk(this.parse(script, {
        sourceType: 'module',
        ecmaVersion: 'latest'
      }), {
        enter (_node) {
          if (_node.type !== 'CallExpression' || (_node as CallExpression).callee.type !== 'Identifier') { return }
          const node: CallExpression = _node as CallExpression
          if (keyedFunctions.includes((node.callee as any).name) && node.arguments.length < 4) {
            const end = (node as any).end
            s.appendLeft(
              codeIndex + end - 1,
              (node.arguments.length ? ', ' : '') + "'$" + hash(`${relativeID}-${++count}`) + "'"
            )
          }
        }
      })
      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: options.sourcemap
            ? s.generateMap({ source: id, includeContent: true })
            : undefined
        }
      }
    }
  }
})
