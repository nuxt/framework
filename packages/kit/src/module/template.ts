import fs from 'fs'
import { basename, parse } from 'path'
import hash from 'hash-sum'
import { useNuxt } from '../nuxt'

export interface TemplateOpts {
  filename?: string
  fileName?: string
  options?: Record<string, any>
  src: string
  ssr?: boolean
  mode?: 'all' | 'server' | 'client'
}

export function addTemplate (tmpl: TemplateOpts | string) {
  const nuxt = useNuxt()

  if (!tmpl) {
    throw new Error('Invalid tmpl: ' + JSON.stringify(tmpl))
  }

  // Validate & parse source
  const src = typeof tmpl === 'string' ? tmpl : tmpl.src
  const srcPath = parse(src)

  if (typeof src !== 'string' || !fs.existsSync(src)) {
    throw new Error('tmpl src not found: ' + src)
  }

  // Mostly for DX, some people prefers `filename` vs `fileName`
  const fileName = typeof tmpl === 'string' ? '' : tmpl.fileName || tmpl.filename
  // Generate unique and human readable dst filename if not provided
  const dst = fileName || `${basename(srcPath.dir)}.${srcPath.name}.${hash(src)}${srcPath.ext}`
  // Add to tmpls list
  const tmplObj = {
    src,
    dst,
    options: typeof tmpl === 'string' ? undefined : tmpl.options
  }

  nuxt.options.build.templates.push(tmplObj)

  return tmplObj
}
