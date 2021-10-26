import { execSync } from 'child_process'
import { resolve } from 'pathe'
import { pathExists, remove } from 'fs-extra'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'upgrade',
    usage: 'npx nuxi upgrade [--force|-f] [--verbose|-v]',
    description: 'Upgrade nuxt3'
  },
  async invoke (args) {
    const rootDir = resolve(args._[0] || '.')
    const verbose = args.verbose || args.v

    const yarnLock = 'yarn.lock'
    const npmLock = 'package-lock.json'

    if (verbose) { console.log('Detecting package manager...') }
    const [isYarn, isNpm] = await Promise.all([
      pathExists(resolve(rootDir, yarnLock)),
      pathExists(resolve(rootDir, npmLock))
    ])
    const packageManager = isYarn ? 'yarn' : isNpm ? 'npm' : null
    if (!packageManager) {
      throw new Error('Cannot detect Package Manager.')
    }
    const packageManagerVersion = execSync(`${packageManager} --version`).toString('utf8').trim()
    if (verbose) { console.log('Package Manager:', packageManager, packageManagerVersion) }

    if (args.force || args.f) {
      if (verbose) { console.log('Removing lock file and node_modules...') }
      await Promise.all([
        remove(yarnLock),
        remove(npmLock),
        remove('node_modules')
      ])
    }

    if (verbose) { console.log('Upgrading nuxt3...') }
    if (isYarn && Number(packageManagerVersion.split('.')[0]) > 1) {
      execSync(`${packageManager} up nuxt3 -i`, { stdio: 'inherit' })
    } else {
      execSync(`${packageManager} upgrade nuxt3`, { stdio: 'inherit' })
    }

    console.log('Upgrade nuxt3 success.')
  }
})
