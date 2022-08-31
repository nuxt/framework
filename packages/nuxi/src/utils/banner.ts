import { createRequire } from 'node:module'
import clear from 'clear'
import { gray, green } from 'colorette'
import { version } from '../../package.json'

export function showBanner (_clear?: boolean) {
  if (_clear) { clear() }
  console.log(green(`Nuxi ${version}`))
}

export function showVersions (cwd: string) {
  const _require = createRequire(cwd)
  const versions = []
  for (const pkg of ['nuxt', 'nitropack', 'vite', 'webpack']) {
    try {
      const { version } = _require(`${pkg}/package.json`)
      versions.push(pkg + '@' + version)
    } catch {
      // Not found
    }
  }
  console.log(gray(versions.join(' ')))
}
