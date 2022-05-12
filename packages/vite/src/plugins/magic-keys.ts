import crypto from 'node:crypto'
import { pathToFileURL } from 'node:url'
import type { Plugin } from 'vite'
import { parse } from 'acorn'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import type { CallExpression } from 'estree'
import { parseURL } from 'ufo'

export interface MagicKeysOptions {
  sourcemap?: boolean
  useAcorn?: boolean
}

function createKey (source: string) {
  const hash = crypto.createHash('md5')
  hash.update(source)
  return hash.digest('base64').toString()
}

const keyedFunctions = [
  'useState', 'useFetch', 'useAsyncData', 'useLazyAsyncData', 'useLazyFetch'
]

export const magicKeysPlugin = (options: MagicKeysOptions = {}): Plugin => {
  return {
    name: 'nuxt:magic-keys',
    enforce: 'post',
    transform (code, id) {
      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      if (!pathname.match(/\.([cm][jt]sx?|vue)/)) { return }
      if (!keyedFunctions.some(f => code.includes(f))) { return }
      const { 0: script = code, index: codeIndex = 0 } = code.match(/(?<=<script[^>]*>)[\S\s.]*?(?=<\/script>)/) || []
      const s = new MagicString(code)
      // https://github.com/unjs/unplugin/issues/90
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
              (node.arguments.length ? ', ' : '') + "'" + createKey(`${id}-${codeIndex + end}`) + "'"
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
