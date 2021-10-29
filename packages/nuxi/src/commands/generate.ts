import execa from 'execa'
import { resolve } from 'pathe'
import { isNuxt3 } from '@nuxt/kit'

import { loadKit } from '../utils/kit'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'generate',
    usage: 'npx nuxi generate [rootDir]',
    description: ''
  },
  async invoke (args) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'
    const rootDir = resolve(args._[0] || '.')

    const { loadNuxt } = await loadKit(rootDir)
    const nuxt = await loadNuxt({ rootDir })

    if (isNuxt3(nuxt)) {
      throw new Error('`nuxt generate` is not supported in Nuxt 3. Please follow this RFC: https://git.io/JKfvx')
    } else {
      // Forwards argv to `nuxt generate`
      await execa('npx nuxt', process.argv.slice(2), { stdio: 'inherit' })
    }
  }
})
