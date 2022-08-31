import { createRequire } from 'node:module'
import clear from 'clear'
import { gray, green } from 'colorette'
import { version } from '../../package.json'

export function showBanner (_clear?: boolean) {
  if (_clear) { clear() }
  console.log(gray(`nuxi ${version}`))
}

export function showVersions (cwd: string) {
  const _require = createRequire(cwd)
  const versions = []
  for (const pkg of ['nuxt', 'nitropack', 'vite', 'webpack']) {
    try {
      const { version } = _require(`${pkg}/package.json`)
      const fullName = pkg + '@' + version
      versions.push(pkg === 'nuxt' ? green(fullName) : gray(fullName))
    } catch {
      // Not found
    }
  }
  console.log(versions.join(' '))
}
