
import { resolve } from 'upath'
import { requireModule } from '../utils/cjs'

export async function invoke (args) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production'
  const rootDir = resolve(args._[0] || '.')

  const { loadNuxt, buildNuxt } = requireModule('@nuxt/kit', rootDir)

  const nuxt = await loadNuxt({ rootDir })
  await buildNuxt(nuxt)
}

export const meta = {
  usage: 'nu build [rootDir]',
  description: 'Build nuxt for production deployment'
}
