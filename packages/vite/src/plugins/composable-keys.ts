import { pathToFileURL } from 'node:url'
import type { Plugin } from 'vite'
import { isAbsolute, relative } from 'pathe'
import { parse } from 'acorn'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { hash } from 'ohash'
import type { CallExpression } from 'estree'
import { parseURL } from 'ufo'

export interface ComposableKeysOptions {
  sourcemap?: boolean
  useAcorn?: boolean
  rootDir?: string
}

const keyedFunctions = [
  'useState', 'useFetch', 'useAsyncData', 'useLazyAsyncData', 'useLazyFetch'
]
const KEYED_FUNCTIONS_RE = new RegExp(`(${keyedFunctions.join('|')})`)

export const composableKeysPlugin = (options: ComposableKeysOptions = {}): Plugin => {
  return {
    name: 'nuxt:composable-keys',
    enforce: 'post',
    transform (code, id) {
      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      if (!pathname.match(/\.(m?[jt]sx?|vue)/)) { return }
      if (!KEYED_FUNCTIONS_RE.test(code)) { return }
      const { 0: script = code, index: codeIndex = 0 } = code.match(/(?<=<script[^>]*>)[\S\s.]*?(?=<\/script>)/) || []
      const s = new MagicString(code)
      // https://github.com/unjs/unplugin/issues/90
      const relativeID = isAbsolute(id) ? relative(options.rootDir, id) : id
      walk(options.useAcorn
        ? parse(script, {
          sourceType: 'module',
          ecmaVersion: 'latest'
        })
        : this.parse(script), {
        enter (node: CallExpression) {
          if (node.type !== 'CallExpression' || node.callee.type !== 'Identifier') { return }
          if (keyedFunctions.includes(node.callee.name)) {
            const end = (node as any).end
            s.appendLeft(
              codeIndex + end - 1,
              (node.arguments.length ? ', ' : '') + "'$" + hash(`${relativeID}-${codeIndex + end}`) + "'"
            )
          }
        }
      })
      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: options.sourcemap && s.generateMap({ source: id, includeContent: true })
        }
      }
    }
  }
}
