import { promises as fsp } from 'node:fs'
import lodashTemplate from 'lodash.template'
import { genSafeVariableName, genDynamicImport, genImport } from 'knitwork'

import type { NuxtTemplate } from '@nuxt/schema'
import { isArray } from '@nuxt/utils'

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

/** @deprecated */
const serialize = (data: any) => JSON.stringify(data, null, 2).replace(/"{(.+)}"(?=,?$)/gm, r => JSON.parse(r).replace(/^{(.*)}$/, '$1'))

/** @deprecated */
const importSources = (sources: string | string[], { lazy = false } = {}) => {
  if (!isArray(sources)) {
    sources = [sources]
  }
  return sources.map(src => lazy
    ? `const ${genSafeVariableName(src)} = ${genDynamicImport(src, { comment: `webpackChunkName: ${JSON.stringify(src)}` })}`
    : genImport(src, genSafeVariableName(src))).join('\n')
}

/** @deprecated */
const importName = genSafeVariableName

/** @deprecated */
export const templateUtils = { serialize, importName, importSources }
