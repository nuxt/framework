import { pathToFileURL } from 'node:url'
import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import { ComponentsOptions } from '@nuxt/schema'
import MagicString from 'magic-string'
import { isAbsolute, relative } from 'pathe'
import { hash } from 'ohash'

interface LoaderOptions {
  sourcemap?: boolean
  transform?: ComponentsOptions['transform'],
  rootDir: string
}

function isVueTemplate (id: string) {
  // Bare `.vue` file (in Vite)
  if (id.endsWith('.vue')) {
    return true
  }

  const { search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
  if (!search) {
    return false
  }

  const query = parseQuery(search)

  // Macro
  if (query.macro) {
    return true
  }

  // Non-Vue or Styles
  if (!('vue' in query) || query.type === 'style') {
    return false
  }

  // Query `?vue&type=template` (in Webpack or external template)
  return true
}

export const clientIfFailPlugin = createUnplugin((options: LoaderOptions) => {
  const exclude = options.transform?.exclude || []
  const include = options.transform?.include || []

  return {
    name: 'nuxt:client-if-fail-auto-id',
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
