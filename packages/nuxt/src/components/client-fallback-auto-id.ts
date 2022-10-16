import { createUnplugin } from 'unplugin'
import { ComponentsOptions } from '@nuxt/schema'
import MagicString from 'magic-string'
import { isAbsolute, relative } from 'pathe'
import { hash } from 'ohash'
import { isVueTemplate } from './helpers'

interface LoaderOptions {
  sourcemap?: boolean
  transform?: ComponentsOptions['transform'],
  rootDir: string
}

export const clientFallbackAutoIdPlugin = createUnplugin((options: LoaderOptions) => {
  const exclude = options.transform?.exclude || []
  const include = options.transform?.include || []

  return {
    name: 'nuxt:client-fallback-auto-id',
    enforce: 'pre',
    transformInclude (id) {
      if (exclude.some(pattern => id.match(pattern))) {
        return false
      }
      if (include.some(pattern => id.match(pattern))) {
        return true
      }
      return isVueTemplate(id)
    },
    transform (code, id) {
      const s = new MagicString(code)
      const relativeID = isAbsolute(id) ? relative(options.rootDir, id) : id

      s.replace(/<([cC]lient-?[iI]f-?[fF]ail)(.*)>/g, (full, name, attrs, offset) => {
        return `<${name}${attrs} uid="${'$' + hash(`${relativeID}-${offset}`)}">`
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
