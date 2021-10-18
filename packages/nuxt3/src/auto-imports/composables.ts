import { promises as fs, existsSync } from 'fs'
import { parse as parsePath, join } from 'pathe'
import globby from 'globby'
import { findExports } from 'mlly'
import { camelCase } from 'scule'
import { AutoImport } from '@nuxt/kit'
import { filterInPlace } from './utils'

export async function scanForComposables (dir: string, autoImports: AutoImport[]) {
  if (!existsSync(dir)) { return }

  const files = await globby(
    ['*.{ts,js,tsx,jsx,mjs,cjs,mts,cts}'],
    { cwd: dir }
  )

  await Promise.all(
    files.map(async (file) => {
      const importPath = join('~/composables', file)

      // Remove original entries from the same import (for build watcher)
      filterInPlace(autoImports, i => i.from !== importPath)

      const code = await fs.readFile(join(dir, file), 'utf-8')
      const exports = findExports(code)
      const defaultExport = exports.find(i => i.type === 'default')

      if (defaultExport) {
        autoImports.push({ as: camelCase(parsePath(file).name), from: importPath, name: 'default' })
      }
      for (const exp of exports) {
        if (exp.type === 'named') {
          for (const name of exp.names) {
            autoImports.push({ as: name, name, from: importPath })
          }
        } else if (exp.type === 'declaration') {
          autoImports.push({ as: exp.name, name: exp.name, from: importPath })
        }
      }
    })
  )
}
