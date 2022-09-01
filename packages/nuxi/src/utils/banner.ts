import { createRequire } from 'node:module'
import clear from 'clear'
import { gray, green } from 'colorette'
import { version } from '../../package.json'

export function showBanner (_clear?: boolean) {
  if (_clear) { clear() }
  console.log(gray(`Nuxi ${version}`))
}

export function showVersions (cwd: string) {
  const _require = createRequire(cwd)
  const getPkgWithVersion = (pkg: string, name: string) => {
    try {
      const { version } = _require(`${pkg}/package.json`)
      if (version) {
        return name + ' ' + version
      }
    } catch { /* not found */ }
    return pkg
  }
  console.log(
    green(getPkgWithVersion('nuxt', 'Nuxt')),
    gray('running with'),
    gray(getPkgWithVersion('nitropack', 'Nitro'))
  )
}
