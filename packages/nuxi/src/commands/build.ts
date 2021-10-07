import { resolve } from 'pathe'
import consola from 'consola'
import { importModule } from '../utils/cjs'

import { defineNuxtCommand, invokeCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'build',
    usage: 'npx nuxi build [rootDir]',
    description: 'Build nuxt for production deployment'
  },
  async invoke (args) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'
    const rootDir = args.rootDir || resolve(args._[0] || '.')

    const { loadNuxt, buildNuxt } = await importModule('@nuxt/kit', rootDir) as typeof import('@nuxt/kit')

    const nuxt = args.nuxt || await loadNuxt({ rootDir })

    await invokeCommand('prepare', { nuxt, rootDir })

    nuxt.hook('error', (err) => {
      consola.error('Nuxt Build Error:', err)
      process.exit(1)
    })

    await buildNuxt(nuxt)
  }
})
