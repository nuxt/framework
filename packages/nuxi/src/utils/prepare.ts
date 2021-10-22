import { promises as fsp } from 'fs'
import { join, relative, resolve } from 'pathe'
import { Nuxt, TSReference } from '@nuxt/kit'
import type { TSConfig } from 'pkg-types'
import { getModulePaths, getNearestPackage } from './cjs'

export const writeTypes = async (nuxt: Nuxt) => {
  const modulePaths = getModulePaths(nuxt.options.modulesDir)
  const rootDir = nuxt.options.rootDir

  const tsConfig: TSConfig = {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'Node',
      strict: true,
      allowJs: true,
      noEmit: true,
      resolveJsonModule: true,
      types: ['node'],
      baseUrl: relative(nuxt.options.buildDir, nuxt.options.rootDir),
      paths: {}
    },
    include: [
      '**/*',
      join(relative(nuxt.options.buildDir, nuxt.options.rootDir), '**/*')
    ]
  }

  const aliases = {
    ...nuxt.options.alias,
    '#build': nuxt.options.buildDir
  }

  for (const alias in aliases) {
    const relativePath = relative(nuxt.options.rootDir, aliases[alias]).replace(/(?<=\w)\.\w+$/g, '') /* remove extension */ || '.'
    tsConfig.compilerOptions.paths[alias] = [relativePath]

    try {
      const { isDirectory } = await fsp.stat(resolve(nuxt.options.rootDir, relativePath))
      if (isDirectory) {
        tsConfig.compilerOptions.paths[`${alias}/*`] = [`${relativePath}/*`]
      }
    } catch { }
  }

  const references: TSReference[] = [
    ...nuxt.options.buildModules,
    ...nuxt.options.modules,
    ...nuxt.options._modules
  ]
    .filter(f => typeof f === 'string')
    .map(id => ({ types: getNearestPackage(id, modulePaths)?.name || id }))

  const declarations: string[] = []

  await nuxt.callHook('builder:generateApp')
  await nuxt.callHook('prepare:types', { references, declarations, tsConfig })

  const declaration = [
    '// This file is auto generated by `nuxt prepare`',
    '// Please do not manually modify this file.',
    '',
    ...references.map((ref) => {
      if ('path' in ref) {
        ref.path = relative(rootDir, ref.path)
      }
      return `/// <reference ${renderAttrs(ref)} />`
    }),
    ...declarations,
    'export {}',
    ''
  ].join('\n')

  async function writeFile () {
    const tsConfigPath = resolve(nuxt.options.buildDir, 'tsconfig.json')
    await fsp.writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2))

    const declarationPath = resolve(nuxt.options.buildDir, 'nuxt.d.ts')
    await fsp.writeFile(declarationPath, declaration)
  }

  // This is needed for Nuxt 2 which clears the build directory again before building
  // https://github.com/nuxt/nuxt.js/blob/dev/packages/builder/src/builder.js#L144
  nuxt.hook('builder:prepared', writeFile)

  await writeFile()
}

function renderAttrs (obj: Record<string, string>) {
  return Object.entries(obj).map(e => renderAttr(e[0], e[1])).join(' ')
}

function renderAttr (key: string, value: string) {
  return value ? `${key}="${value}"` : ''
}
