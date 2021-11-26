import { promises as fsp } from 'fs'
import { execa } from 'execa'
import { resolve } from 'pathe'
import consola from 'consola'

import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'preview',
    usage: 'npx nuxi preview|start [rootDir]',
    description: 'Launches a built Nuxt server for local testing.'
  },
  async invoke (args) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'
    const rootDir = resolve(args._[0] || '.')

    try {
      const nitroConfigPath = resolve(rootDir, '.output/nitro.json')
      const nitroConfig = JSON.parse(await fsp.readFile(nitroConfigPath, 'utf-8'))
      if (nitroConfig.preset === 'server') {
        await execa('node', ['.output/server/index.mjs'], { stdio: 'inherit', cwd: rootDir })
      } else {
        consola.error('Preview is only supported with `server` preset.')
      }
    } catch (e) {
      if (e.message?.includes?.('ENOENT')) {
        return consola.error('You must run `nuxi build` before previewing your site.')
      }
      consola.error(e)
    }
  }
})
