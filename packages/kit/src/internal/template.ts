import { promises as fsp } from 'node:fs'
import lodashTemplate from 'lodash.template'
import hash from 'hash-sum'
import { camelCase } from 'scule'
import { basename, extname } from 'pathe'
import { genDynamicImport, genImport } from 'knitwork'

import type { NuxtTemplate } from '@nuxt/schema'

export async function compileTemplate (template: NuxtTemplate, ctx: any) {
  const data = { ...ctx, options: template.options }
  if (template.src) {
    try {
      const srcContents = await fsp.readFile(template.src, 'utf-8')
      return lodashTemplate(srcContents, {})(data)
    } catch (err) {
      console.error('Error compiling template: ', template)
      throw err
    }
  }
  if (template.getContents) {
    return template.getContents(data)
  }
  throw new Error('Invalid template: ' + JSON.stringify(template))
}

const serialize = (data: any) => JSON.stringify(data, null, 2).replace(/"{(.+)}"(?=,?$)/gm, r => JSON.parse(r).replace(/^{(.*)}$/, '$1'))

const importName = (src: string) => `${camelCase(basename(src, extname(src))).replace(/[^a-zA-Z?\d\s:]/g, '')}_${hash(src)}`

const importSources = (sources: string | string[], { lazy = false } = {}) => {
  if (!Array.isArray(sources)) {
    sources = [sources]
  }
  return sources.map((src) => {
    if (lazy) {
      return `const ${importName(src)} = ${genDynamicImport(src, { comment: `webpackChunkName: ${JSON.stringify(src)}` })}`
    }
    return genImport(src, importName(src))
  }).join('\n')
}

export const templateUtils = { serialize, importName, importSources }
