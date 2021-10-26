import { execSync } from 'child_process'
import { rmdir } from 'fs/promises'
import { existsSync } from 'fs'
import consola from 'consola'
import { resolve } from 'pathe'
import { getNearestPackage } from '../utils/cjs'
import { defineNuxtCommand } from './index'

function getNuxtVersion () {
  return getNearestPackage('nuxt3', './node_modules')?.version
}

export default defineNuxtCommand({
  meta: {
    name: 'upgrade',
    usage: 'npx nuxi upgrade [--force|-f]',
    description: 'Upgrade nuxt3'
  },
  async invoke (args) {
    const rootDir = resolve(args._[0] || '.')

    const yarnLock = 'yarn.lock'
    const npmLock = 'package-lock.json'

    consola.info('Detecting package manager...')
    const isYarn = existsSync(resolve(rootDir, yarnLock))
    const isNpm = existsSync(resolve(rootDir, npmLock))
    const packageManager = isYarn ? 'yarn' : isNpm ? 'npm' : null
    if (!packageManager) {
      throw new Error('Cannot detect Package Manager.')
    }
    const packageManagerVersion = execSync(`${packageManager} --version`).toString('utf8').trim()
    consola.info('Package Manager:', packageManager, packageManagerVersion)

    if (args.force || args.f) {
      consola.info('Removing lock file and node_modules...')
      await Promise.all([
        rmdir(yarnLock, { recursive: true }),
        rmdir(npmLock, { recursive: true }),
        rmdir('node_modules', { recursive: true })
      ])
    }

    consola.info('Upgrading nuxt3...')
    const prevVersion = getNuxtVersion()
    if (isYarn && Number(packageManagerVersion.split('.')[0]) > 1) {
      execSync(`${packageManager} up nuxt3 -i`, { stdio: 'inherit' })
    } else {
      execSync(`${packageManager} upgrade nuxt3`, { stdio: 'inherit' })
    }
    const currentVersion = getNuxtVersion()

    if (prevVersion === currentVersion) {
      consola.success('You\'re already using the latest nuxt3.')
    } else {
      consola.success('Upgrade nuxt3 success. Upgraded from', prevVersion, 'to', currentVersion)
    }
  }
})
