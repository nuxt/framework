import { execa } from 'execa'
import { resolve } from 'pathe'
import { tryResolveModule } from '../utils/cjs'

import { loadKit } from '../utils/kit'
import { writeTypes } from '../utils/prepare'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'typecheck',
    usage: 'npx nuxi typecheck [rootDir]',
    description: 'Runs `vue-tsc` to check types throughout your app.'
  },
  async invoke (args) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'
    const rootDir = resolve(args._[0] || '.')

    const { loadNuxt } = await loadKit(rootDir)
    const nuxt = await loadNuxt({ rootDir, config: { _prepare: true } })

    // Generate types and close nuxt instance
    await writeTypes(nuxt)
    await nuxt.close()

    // Prefer local install if possible
    const hasLocalInstall = tryResolveModule('typescript') && tryResolveModule('vue-tsc/package.json')
    const npxArgs = hasLocalInstall ? '' : '-p vue-tsc -p typescript '

    await execa('npx', `${npxArgs}vue-tsc --noEmit`.split(' '), { stdio: 'inherit' })
  }
})
