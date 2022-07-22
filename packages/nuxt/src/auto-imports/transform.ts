import { pathToFileURL } from 'node:url'
import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import { Unimport } from 'unimport'
import { AutoImportsOptions } from '@nuxt/schema'

export const TransformPlugin = createUnplugin(({ ctx, options, sourcemap }: {ctx: Unimport, options: Partial<AutoImportsOptions>, sourcemap?: boolean }) => {
  return {
    name: 'nuxt:auto-imports-transform',
    enforce: 'post',
    transformInclude (id) {
      const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      const query = parseQuery(search)

      const exclude = options.transform?.exclude || [/[\\/]node_modules[\\/]/]
      const include = options.transform?.include || []

      // Custom includes - exclude node_modules by default
      if (exclude.some(pattern => id.match(pattern)) && !include.some(pattern => id.match(pattern))) {
        return false
      }

      // vue files
      if (
        id.endsWith('.vue') ||
        ('vue' in query && (query.type === 'template' || query.type === 'script' || query.macro))
      ) {
        return true
      }

      // js files
      if (pathname.match(/\.((c|m)?j|t)sx?$/g)) {
        return true
      }
    },
    async transform (_code, id) {
      const { code, s } = await ctx.injectImports(_code, id)
      if (code === _code) {
        return
      }
      return {
        code,
        map: sourcemap && s.generateMap({ source: id, includeContent: true })
      }
    }
  }
})
