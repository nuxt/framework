import { execa } from 'execa'
import consola from 'consola'
import { resolve } from 'pathe'
import { tryResolveModule } from '../utils/cjs'
import { defineNuxtCommand } from './index'

// Stub `build-module` until we have proper support for it
// @see https://github.com/nuxt/module-builder/issues/32
export default defineNuxtCommand({
  meta: {
    name: 'build-module',
    usage: 'npx nuxi build-module [--stub] [rootDir]',
    description: 'Helper command for using `@nuxt/module-builder`'
  },
  async invoke (args) {
    // Execute `@nuxt/module-builder` locally if possible
    const rootDir = resolve(args._[0] || '.')
    const hasLocal = tryResolveModule('@nuxt/module-builder/package.json', rootDir)

    const execArgs = Object.entries({
      '--stub': args.stub
    }).filter(([, value]) => value).map(([key]) => key)

    if (!hasLocal) {
      return consola.error('Missing `@nuxt/module-builder` dependency, please install it first to use this command')
    }

    await execa('nuxt-module-build', execArgs, { preferLocal: true, stdio: 'inherit', cwd: rootDir })
  }
})
