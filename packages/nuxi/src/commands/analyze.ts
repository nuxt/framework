import { join, resolve } from 'pathe'
import { cyan } from 'colorette'
import { importModule } from '../utils/cjs'
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

    const { loadNuxt, buildNuxt } = await importModule('@nuxt/kit', rootDir) as typeof import('@nuxt/kit')

    const outputDir = join(rootDir, '.nuxt/analyze/output')
    const buildDir = join(rootDir, '.nuxt/analyze/build')
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

    await buildNuxt(nuxt)

    console.log(`Nitro server analysis available at ${cyan(join(buildDir, 'stats/nitro.html'))}`)
    console.log(`Client analysis available at ${cyan(join(buildDir, 'stats/client.html'))}`)
  }
})
