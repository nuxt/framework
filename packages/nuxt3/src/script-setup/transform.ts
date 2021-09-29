import { getQuery } from 'ufo'
import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'

const NUXT_APIS = [
  'asyncData'
]

const NUXT_APIS_REGEX = new RegExp(`(?:${NUXT_APIS.join('|')})\\(`)

const DEFINE_COMPONENT_VUE = '_defineComponent('
const DEFINE_COMPONENT_NUXT = '_defineNuxtComponent('

export const transformNuxtSetup = createUnplugin(() => ({
  name: 'nuxt:transform-setup',
  enforce: 'post',
  transformInclude (id) {
    const query = getQuery(id)
    return id.endsWith('.vue') && (Object.keys(query).length === 0 || (query.setup && query.type === 'script'))
  },
  transform (code, id) {
    const query = getQuery(id)

    if (!query.nuxt && !code.match(NUXT_APIS_REGEX)) {
      return
    }

    const index = code.indexOf(DEFINE_COMPONENT_VUE)
    if (index < 0) {
      return
    }

    const s = new MagicString(code)
    s.overwrite(index, index + DEFINE_COMPONENT_VUE.length, DEFINE_COMPONENT_NUXT)
    s.prepend('import { defineNuxtComponent as _defineNuxtComponent } from "#app"\n')

    return {
      code: s.toString(),
      map: s.generateMap({
        source: id
      })
    }
  }
}))
