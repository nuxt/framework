import createResolver from 'postcss-import-resolver'
import defu from 'defu'
import { Nuxt, requireModule } from '@nuxt/kit'
import { ViteOptions } from './vite'

export function resolveCSSOptions (nuxt: Nuxt): ViteOptions['css'] {
  const css: ViteOptions['css'] = {
    postcss: {
      plugins: []
    }
  }

  const plugins = defu(nuxt.options.build.postcss.postcssOptions.plugins, {
    // https://github.com/postcss/postcss-import
    'postcss-import': {
      resolve: createResolver({
        alias: { ...nuxt.options.alias },
        modules: [
          nuxt.options.srcDir,
          nuxt.options.rootDir,
          ...nuxt.options.modulesDir
        ]
      })
    },

    // https://github.com/postcss/postcss-url
    'postcss-url': {},

    // https://github.com/csstools/postcss-preset-env
    'postcss-preset-env': {}
  })

  for (const name in plugins) {
    const opts = plugins[name]
    if (!opts) {
      continue
    }
    const plugin = requireModule(name)
    // @ts-ignore
    css.postcss.plugins.push(plugin(opts))
  }

  return css
}
