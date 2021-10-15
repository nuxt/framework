import { promises as fs, existsSync } from 'fs'
import { parse as parsePath, join } from 'pathe'
import globby from 'globby'
import { findExports } from 'mlly'
import { camelCase } from 'scule'
import { IdentifierMap } from './types'
import { updateIdentifier } from './utils'

export async function scanForComposables (dir: string, identifiers: IdentifierMap) {
  if (!existsSync(dir)) { return }

  const files = await globby(
    ['*.{ts,js,tsx,jsx,mjs,cjs,mts,cts}'],
    { cwd: dir }
  )

  await Promise.all(
    files.map(async (file) => {
      const code = await fs.readFile(join(dir, file), 'utf-8')
      const exports = findExports(code)
      const importPath = '~/composables/' + file
      const defaultExport = exports.find(i => i.type === 'default')
      if (defaultExport) {
        updateIdentifier(identifiers, camelCase(parsePath(file).name), { from: importPath, name: 'default' })
      }
      for (const exp of exports) {
        if (exp.type === 'named') {
          for (const name of exp.names) {
            updateIdentifier(identifiers, name, { from: importPath })
          }
        } else if (exp.type === 'declaration') {
          updateIdentifier(identifiers, exp.name, { from: importPath })
        }
      }
    })
  )
}
