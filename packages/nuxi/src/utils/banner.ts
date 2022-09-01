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
  const getPkgVersion = (pkg: string) => {
    try {
      const { version } = _require(`${pkg}/package.json`)
      return version || ''
    } catch { /* not found */ }
    return ''
  }
  const nuxtVersion = getPkgVersion('nuxt') || getPkgVersion('nuxt-edge')
  const nitroVersion = getPkgVersion('nitropack')
  console.log(
    green(`Nuxt ${nuxtVersion}`),
    nitroVersion ? gray(`running with Nitro ${nitroVersion}`) : ''
  )
}
