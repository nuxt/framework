import { createRequire } from 'module'
import { normalize } from 'pathe'
import { getQuery } from 'ufo'

const _require = createRequire(process.cwd())

export default class NuxtSetupTransformerPlugin {
  apply (compiler) {
    compiler.options.module.rules.push({
      include (id) {
        const query = getQuery(id)
        return id.endsWith('.vue') || (query.nuxt && query.setup && query.type === 'script')
      },
      enforce: 'post',
      use: [{
        ident: 'NuxtSetupTransformerPlugin',
        loader: normalize(_require.resolve('@nuxt/webpack-builder/dist/nuxt-setup-loader.cjs'))
      }]
    })
  }
}
