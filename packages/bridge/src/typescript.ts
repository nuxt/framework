import { createRequire } from 'module'
import { extendWebpackConfig, useNuxt } from '@nuxt/kit'

const extensions = ['ts', 'tsx', 'cts', 'mts']
const typescriptRE = /\.[cm]?tsx?$/

export function setupTypescript () {
  const nuxt = useNuxt()

  nuxt.options.extensions.push(...extensions)
  nuxt.options.build.additionalExtensions.push(...extensions)

  const _require = createRequire(import.meta.url)
  const babelPlugin = _require.resolve('@babel/plugin-transform-typescript')
  nuxt.options.build.babel.plugins = nuxt.options.build.babel.plugins || []

  const hasBabelPlugin = nuxt.options.build.babel.plugins.some((r) => {
    if (typeof r === 'string' && r.includes('@babel/plugin-transform-typescript')) { return true }
    if (Array.isArray(r) && r.some(i => i.includes('@babel/plugin-transform-typescript'))) { return true }
    return false
  })

  if (!hasBabelPlugin) {
    nuxt.options.build.babel.plugins.unshift(babelPlugin)
  }

  extendWebpackConfig((config) => {
    config.resolve.extensions!.push(...extensions.map(e => `.${e}`))
    const babelRule: any = config.module.rules.find((rule: any) => rule.test?.test('test.js'))
    config.module.rules.unshift({
      ...babelRule,
      test: typescriptRE
    })
  })
}
