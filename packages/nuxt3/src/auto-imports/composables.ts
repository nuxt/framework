import { promises as fs, existsSync } from 'fs'
import { Nuxt } from '@nuxt/kit'
import globby from 'globby'
import { join } from 'pathe'
import { IdentifierMap } from './types'

export async function scanForCompoables (nuxt: Nuxt, identifiers: IdentifierMap) {
  const dir = join(nuxt.options.rootDir, 'composables')
  if (!existsSync(dir)) { return }

  const files = await globby(
    ['*.{ts,js,tsx,jsx,mjs,cjs,mts,cts}'],
    { cwd: dir }
  )

  await Promise.all(
    files.map(async (file) => {
      const code = await fs.readFile(join(dir, file), 'utf-8')
      const exports = extractNamedExports(code)
      for (const name of exports) {
        // TODO: warn if identifier already exists?
        identifiers[name] = '~/composables/' + file
      }
    })
  )
}

const exportDecalareRE = /\bexport\s+(?:function|let|const|var)\s+([\w$_]+)/g
const exportObjectRE = /\bexport\s+{([^}]+)}/g
const namedAsRE = /^.*?\sas\s/
const identifierRE = /^[\w$_]+$/

export function extractNamedExports (code: string) {
  const names = new Set<string>()

  Array.from(code.matchAll(exportDecalareRE))
    .forEach(([, name]) => names.add(name))

  Array.from(code.matchAll(exportObjectRE))
    .forEach(([, body]) => {
      body.split(/,/g)
        .map(name => name.replace(namedAsRE, '').trim())
        .filter(name => identifierRE.test(name))
        .forEach(name => names.add(name))
    })

  return names
}
