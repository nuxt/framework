import { getQuery, parseURL } from 'ufo'

const NAME = 'NuxtSetupTransformerPlugin'
const DEFINE_COMPONENT_VUE = '_defineComponent('
const DEFINE_COMPONENT_NUXT = '_defineNuxtComponent('

export default class NuxtSetupTransformerPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap(NAME, (bundle) => {
      bundle.hooks.optimizeModules.tap(NAME, (modules) => {
        modules.forEach((mod) => {
          const id = mod.resource
          const { pathname, search } = parseURL(id)
          const query = getQuery(search)

          if (!(pathname.endsWith('.vue') || (query.nuxt && query.setup && query.type === 'script'))) {
            return
          }

          let code = mod._source._value
          if (code && code.includes(DEFINE_COMPONENT_VUE)) {
            code = 'import { defineNuxtComponent as _defineNuxtComponent } from "@nuxt/app"\n' + code.replace(DEFINE_COMPONENT_VUE, DEFINE_COMPONENT_NUXT)
            mod._source._value = code
          }
        })
      })
    })
  }
}
