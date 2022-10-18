import fsp from 'node:fs/promises'
import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { walk } from 'estree-walker'
import { parse } from '@vue/compiler-sfc'
import type { CallExpression, Expression } from 'estree'
import { findStaticImports, parseStaticImport, StaticImport } from 'mlly'
import { transform } from 'esbuild'

const PREFIX = 'virtual:page-meta:'

export interface PageMetaPluginOptions {
  dirs: Array<string | RegExp>
  vfs: Record<string, string>
  dev?: boolean
  sourcemap?: boolean
}

export const PageMetaPlugin = createUnplugin((options: PageMetaPluginOptions) => {
  return {
    name: 'nuxt:page-meta-transform',
    resolveId (id) {
      return id.startsWith(PREFIX) ? id : null
    },
    loadInclude (id) {
      return id.startsWith(PREFIX)
    },
    // Extract page metadata by reading directly from fs
    async load (id) {
      id = id.replace(PREFIX, '').replace(/-vue$/, '.vue')
      this.addWatchFile(id)

      const source: string | null = options.vfs[id] || await fsp.readFile(id, 'utf-8').catch(() => null)

      if (!source) { return 'export default {}' }
      let code: string | null = source

      // Extract <script> or <script setup> block
      if (id.endsWith('.vue')) {
        const { descriptor } = parse(source)
        const block = descriptor.scriptSetup?.content.includes('definePageMeta') ? descriptor.scriptSetup : descriptor.script

        code = block?.lang
          ? await transform(block.content, { loader: block.lang as 'ts' }).then(r => r.code)
          : block?.content || null
      }

      if (!code) { return 'export default {}' }

      const s = new MagicString(source)
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

          let contents = `export default ${code!.slice(meta.start, meta.end) || '{}'}`

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

          s.overwrite(0, source.length, contents)

          return contents
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

      return 'export default {}'
    },
    // Remove references in existing files
    transformInclude (id) {
      return !id.startsWith(PREFIX) &&
        options.dirs.some(dir => typeof dir === 'string' ? id.startsWith(dir) : dir.test(id))
    },
    transform (source, id) {
      const match = source.match(/\bdefinePageMeta\s*\(\s*/)
      if (!match?.[0]) { return }

      const s = new MagicString(source)
      s.overwrite(match.index!, match.index! + match[0].length, `false && /*#__PURE__*/ ${match[0]}`)

      return {
        code: s.toString(),
        map: options.sourcemap
          ? s.generateMap({ source: id, includeContent: true })
          : undefined
      }
    }
  }
})
