import { existsSync, promises as fsp } from 'node:fs'
import { resolve } from 'pathe'
import { findExports } from 'mlly'
import { importModule } from './cjs'

import type { ModuleMeta } from '@nuxt/schema'

export interface IWriteTypesOptions {
  meta: ModuleMeta
  // TODO: Use nuxt options to generate types
  options?: any
}

export const loadUnbuild = async (rootDir: string): Promise<typeof import('unbuild')> => {
  try {
    return await importModule('unbuild', rootDir) as typeof import('unbuild')
  } catch (e: any) {
    if (e.toString().includes("Cannot find module 'unbuild'")) {
      throw new Error('nuxi build-module requires `unbuild` to be installed in your module project to build project. Try installing `unbuild` first.')
    }
    throw e
  }
}

export async function writeModuleTypes (distDir: string, { meta }: IWriteTypesOptions) {
  const dtsFile = resolve(distDir, 'types.d.ts')

  // Read generated module types
  const moduleTypesFile = resolve(distDir, 'module.d.ts')
  const moduleTypes = await fsp.readFile(moduleTypesFile, 'utf8').catch(() => '')
  const typeExports = findExports(moduleTypes)
  const isStub = moduleTypes.includes('export *')

  const hasExportOption = (name: string) => isStub || typeExports.find(exp => exp.names.includes(name))

  const schemaShims = []
  const moduleImports = []
  const moduleImportKeys = [
    { key: 'ModuleOptions', interfaces: ['NuxtConfig', 'NuxtOptions'] },
    { key: 'ModuleHooks', interfaces: ['ModuleHooks'] },
    { key: 'ModulePublicRuntimeConfig', interfaces: ['PublicRuntimeConfig'] },
    { key: 'ModulePrivateRuntimeConfig', interfaces: ['PrivateRuntimeConfig'] }
  ]

  // Generate schema shims
  for (const { key, interfaces } of moduleImportKeys) {
    if (hasExportOption(key)) {
      moduleImports.push(key)
      for (const iface of interfaces) {
        if (iface === 'NuxtConfig' && meta.configKey) {
          schemaShims.push(`  interface ${iface} { ['${meta.configKey}']?: Partial<${key}> }`)
        } else if (iface === 'NuxtOptions' && meta.optionsKey) {
          schemaShims.push(`  interface ${iface} { ['${meta.configKey}']?: ${key} }`)
        } else {
          schemaShims.push(`  interface ${iface} extends ${key} {}`)
        }
      }
    }
  }

  const dtsContents = `
import { ${moduleImports.join(', ')} } from './module'
${schemaShims.length ? `declare module '@nuxt/schema' {\n${schemaShims.join('\n')}\n}\n` : ''}
export { ${typeExports[0].names.join(', ')} } from './module'
`

  await fsp.writeFile(dtsFile, dtsContents, 'utf8')
}

export async function writeModuleCJSStub (distDir: string) {
  const cjsStubFile = resolve(distDir, 'module.cjs')
  
  // If CJS stub already exists, skip
  if (existsSync(cjsStubFile)) return

  const cjsStub = `module.exports = function(...args) {
  return import('./module.mjs').then(m => m.default.call(this, ...args))
}
const _meta = module.exports.meta = require('./module.json')
module.exports.getMeta = () => Promise.resolve(_meta)
`
  await fsp.writeFile(cjsStubFile, cjsStub, 'utf8')
}