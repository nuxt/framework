import { execa } from 'execa'
import consola from 'consola'
import { loadKit } from '../utils/kit'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'test',
    usage: 'npx nuxi test',
    description: 'Run tests'
  },
  async invoke () {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'
    const rootDir = process.cwd()

    consola.warn('`nuxt test` is currently expiremental')

    const { loadNuxtConfig } = await loadKit(rootDir)
    const config = await loadNuxtConfig({ rootDir })

    if (config.vite === false) {
      consola.error('`nuxi test` is currently only supported in Vite mode')
      process.exit(1)
    }

    const vitestArgs = ['vitest', '-r', config.rootDir, ...process.argv.slice(3)]
    consola.info('Starting Vitest...')
    consola.info('$ ' + vitestArgs.join(' '))
    await execa('npx', vitestArgs, { stdio: 'inherit' })
  }
})
