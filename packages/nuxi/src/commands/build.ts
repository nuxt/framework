import { resolve } from 'pathe'
import consola from 'consola'
import { writeTypes } from '../utils/prepare'
import { loadKit } from '../utils/kit'
import { clearDir } from '../utils/fs'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'build',
    usage: 'npx nuxi build [--prerender] [rootDir]',
    description: 'Build nuxt for production deployment'
  },
  async invoke (args) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'

    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Building nuxt in \`${process.env.NODE_ENV}\` mode. This is not recommended.`)
    }

    const rootDir = resolve(args._[0] || '.')

    const { loadNuxt, buildNuxt } = await loadKit(rootDir)

    const nuxt = await loadNuxt({
      rootDir,
      overrides: {
        _generate: args.prerender
      }
    })

    await clearDir(nuxt.options.buildDir)

    await writeTypes(nuxt)

    nuxt.hook('build:error', (err) => {
      consola.error('Nuxt Build Error:', err)
      process.exit(1)
    })

    await buildNuxt(nuxt)
  }
})
