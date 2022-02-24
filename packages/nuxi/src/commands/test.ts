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
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'
    const rootDir = process.cwd()

    consola.warn('`nuxt test` is expiremental')

    const { loadNuxtConfig } = await loadKit(rootDir)
    const config = await loadNuxtConfig({ rootDir })

    // TODO: support Jest and other runners
    consola.info('Starting Vitest...')

    // TODO: prompt auto install if test-utils is not installed
    const { default: start } = await import('@nuxt/test-utils/vitest')
    await start(config, argv)
  }
})
