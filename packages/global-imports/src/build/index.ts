import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import { Identifier } from '../types'

export const BuildPlugin = createUnplugin((identifers: Identifier[]) => ({
  name: 'nuxt-global-imports-build',
  enforce: 'post',
  transformInclude (id) {
    const { pathname, search } = parseURL(id)
    const query = parseQuery(search)

    // vue files
    if (pathname.endsWith('.vue') && (query.type === 'template' || !search)) {
      return true
    }

    // js files
    if (pathname.match(/\.((c|m)?j|t)sx?/g)) {
      return true
    }
  },
  transform (code, id) {
    const ignored = Array.from(code.matchAll(/\bimport\s*\{(.*?)\}\s*from\b/g))
      .flatMap(i => i[1]?.split(',') || [])
      .map(i => i.trim())

    console.log(identifers)

    return code
  }
}))
