import path from 'path'

import consola from 'consola'
import { useNuxt } from '../nuxt'
import { chainFn } from '../utils'
import { addTemplate, TemplateOpts } from './template'

export function addPlugin (tmpl: TemplateOpts) {
  const nuxt = useNuxt()

  const { dst } = addTemplate(tmpl)

  // Add to nuxt plugins
  nuxt.options.plugins.unshift({
    src: path.join(nuxt.options.buildDir, dst),
    // TODO: remove deprecated option in Nuxt 3
    ssr: tmpl.ssr,
    mode: tmpl.mode
  })
}

export function addLayout (tmpl: TemplateOpts, name: string) {
  const nuxt = useNuxt()

  const { dst, src } = addTemplate(tmpl)
  const layoutName = name || path.parse(src).name
  const layout = nuxt.options.layouts[layoutName]

  if (layout) {
    consola.warn(`Duplicate layout registration, "${layoutName}" has been registered as "${layout}"`)
  }

  // Add to nuxt layouts
  nuxt.options.layouts[layoutName] = `./${dst}`

  // If error layout, set ErrorPage
  if (name === 'error') {
    addErrorLayout(dst)
  }
}

export function addErrorLayout (dst: string) {
  const nuxt = useNuxt()

  const relativeBuildDir = path.relative(nuxt.options.rootDir, nuxt.options.buildDir)
  nuxt.options.ErrorPage = `~/${relativeBuildDir}/${dst}`
}

export function addServerMiddleware (middleware) {
  const nuxt = useNuxt()

  nuxt.options.serverMiddleware.push(middleware)
}

export function extendBuild (fn) {
  const nuxt = useNuxt()

  // @ts-ignore TODO
  nuxt.options.build.extend = chainFn(nuxt.options.build.extend, fn)
}

export function extendRoutes (fn) {
  const nuxt = useNuxt()

  nuxt.options.router.extendRoutes = chainFn(nuxt.options.router.extendRoutes, fn)
}
