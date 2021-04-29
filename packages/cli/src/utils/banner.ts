import clear from 'clear'
import { green } from 'colorette'
import { version } from '../../package.json'

export function showBanner (_clear: boolean = false) {
  if (_clear) { clear() }
  console.log(green(`Nuxt CLI v${version}`))
}
