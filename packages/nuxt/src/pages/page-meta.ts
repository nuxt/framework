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
    // Remove references to definePageMeta in existing files
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
