import { createRequire } from 'node:module'
import clear from 'clear'
import { gray, green } from 'colorette'
import { version } from '../../package.json'

export function showBanner (_clear?: boolean) {
  if (_clear) { clear() }
  console.log(gray(`nuxi@${version}`))
}

export function showVersions (cwd: string) {
  const _require = createRequire(cwd)
  const getPkgWithVersion = (pkg: string) => {
    try {
      const { version } = _require(`${pkg}/package.json`)
      if (version) {
        return pkg + '@' + version
      }
    } catch { /* not found */ }
    return ''
  }
  const pkgs = ['vue', 'nitropack', 'vite', 'webpack']
  console.log(
    green(getPkgWithVersion('nuxt') || getPkgWithVersion('nuxt-edge') /* bridge */ || 'nuxt'),
    gray('running with'),
    gray(pkgs.map(pkg => getPkgWithVersion(pkg)).filter(Boolean).join(' ') || '-')
  )
}
