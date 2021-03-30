import path from 'path'
import fs from 'fs'
import hash from 'hash-sum'
import consola from 'consola'
import { useNuxt } from '../nuxt'
import { chainFn } from '../utils'

interface TemplateInput {
  filename?: string
  fileName?: string
  options?: Record<string, any>
  src: string
  ssr?: boolean
  mode?: 'all' | 'server' | 'client'
}

export function addTemplate (template: TemplateInput | string) {
  const nuxt = useNuxt()

  if (!template) {
    throw new Error('Invalid template: ' + JSON.stringify(template))
  }

  // Validate & parse source
  const src = typeof template === 'string' ? template : template.src
  const srcPath = path.parse(src)

  if (typeof src !== 'string' || !fs.existsSync(src)) {
    throw new Error('Template src not found: ' + src)
  }

  // Mostly for DX, some people prefers `filename` vs `fileName`
  const fileName = typeof template === 'string' ? '' : template.fileName || template.filename
  // Generate unique and human readable dst filename if not provided
  const dst = fileName || `${path.basename(srcPath.dir)}.${srcPath.name}.${hash(src)}${srcPath.ext}`
  // Add to templates list
  const templateObj = {
    src,
    dst,
    options: typeof template === 'string' ? undefined : template.options
  }

  nuxt.options.build.templates.push(templateObj)

  return templateObj
}

export function addPlugin (template: TemplateInput) {
  const nuxt = useNuxt()

  const { dst } = addTemplate(template)

  // Add to nuxt plugins
  nuxt.options.plugins.unshift({
    src: path.join(nuxt.options.buildDir, dst),
    // TODO: remove deprecated option in Nuxt 3
    ssr: template.ssr,
    mode: template.mode
  })
}

export function addLayout (template: TemplateInput, name: string) {
  const nuxt = useNuxt()

  const { dst, src } = addTemplate(template)
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
