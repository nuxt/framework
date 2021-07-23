import { promises as fsp } from 'fs'
import { join, relative, resolve } from 'upath'
import type { Argv } from 'mri'

import { requireModule } from '../utils/cjs'
import { exists } from '../utils/fs'

export async function invoke (args: Argv) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production'
  const rootDir = resolve(args._[0] || '.')

  const { loadNuxt, requireModulePkg, tryResolveModule, tryResolvePath } = requireModule('@nuxt/kit', rootDir) as typeof import('@nuxt/kit')
  const nuxt = await loadNuxt({ rootDir })

  const modulePaths = [
    // @ts-ignore
    global.__NUXT_PREPATHS__,
    ...nuxt.options.modulesDir,
    process.cwd(),
    // @ts-ignore
    global.__NUXT_PATHS__
  ]

  function nearestPackageName (_path: string) {
    // See if we've been passed a module name directly
    try {
      return requireModulePkg(_path).name
    } catch { }

    // If not, let's resolve to an absolute path
    let path = tryResolveModule(_path, { paths }) || tryResolvePath(_path, { base: rootDir })

    // ... and then look for a package.json in that file tree
    while (path && path !== rootDir && modulePaths.some(p => path!.startsWith(p))) {
      try {
        return requireModulePkg(path).name
      } catch { }
      path = join(path, '..')
    }

    return null
  }

  const paths = [
    // Built-ins
    '@nuxt/kit',
    '@nuxt/app',
    '@nuxt/nitro',
    // Modules
    ...nuxt.options.buildModules,
    ...nuxt.options.modules,
    ...nuxt.options._modules
  ].filter(f => typeof f === 'string')

  const _references = await Promise.all(paths.map(async (path) => {
    const name = nearestPackageName(path)
    return name
      ? `/// <reference types="${name}" />`
      : await exists(path) && `/// <reference path="${relative(rootDir, path)}" />`
  }))
  const references = Array.from(new Set(_references)).filter(Boolean) as string[]

  const declarationPath = resolve(`${rootDir}/index.d.ts`)
  let declaration = ''
  try {
    declaration = await fsp.readFile(declarationPath, 'utf8')
  } catch { }

  await nuxt.callHook('prepare:types', { references, declaration })

  for (const line of references) {
    if (!declaration.includes(line)) {
      declaration = `${line}\n` + declaration
    }
  }

  await fsp.writeFile(declarationPath, declaration)
}
