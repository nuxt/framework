import { join, resolve } from 'pathe'
import consola from 'consola'
import { writeTypes } from '../utils/prepare'
import { loadKit } from '../utils/kit'
import { clearDir } from '../utils/fs'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'analyze',
    usage: 'npx nuxi analyze [rootDir]',
    description: 'Analyze your nuxt app'
  },
  async invoke (args) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'

    const rootDir = resolve(args._[0] || '.')
    const outputDir = join(rootDir, '.nuxt/analyze/output')
    const buildDir = join(rootDir, '.nuxt/analyze/build')

    const { loadNuxt, buildNuxt } = await loadKit(rootDir)

    const nuxt = await loadNuxt({
      rootDir,
      config: {
        nitro: {
          analyze: {
            filename: join(buildDir, 'stats/nitro.html')
          },
          output: {
            dir: outputDir
          }
        },
        buildDir,
        build: {
          analyze: true
        }
      }
    })

    await clearDir(nuxt.options.buildDir)
    await writeTypes(nuxt)
    await buildNuxt(nuxt)

    consola.log(`Nitro server analysis available at \`${join(buildDir, 'stats/nitro.html')}\``)
    consola.log(`Client analysis available at \`${join(buildDir, 'stats/client.html')}\``)
  }
})
