import consola from 'consola'
import { loadKit } from '../utils/kit'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'test',
    usage: 'npx nuxi test',
    description: 'Run tests'
  },
  async invoke (argv) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'test'
    const rootDir = process.cwd()

    const { loadNuxtConfig } = await loadKit(rootDir)
    const config = await loadNuxtConfig({ rootDir })

    // TODO: support Jest and other runners
    consola.info('Starting Vitest...')

    // TODO: prompt auto install if test-utils is not installed
    let start: typeof import('@nuxt/test-utils/vitest')['default'] | undefined
    try {
      start = await import('@nuxt/test-utils/vitest').then(m => m.default)
    } catch (e) {
      consola.error(e)
      consola.warn('`@nuxt/test-utils` is missing. Run `npm i -D @nuxt/test-utils` or `yarn add -D @nuxt/test-utils` to install')
      return process.exit(1)
    }
    await start(config, argv)
  }
})
