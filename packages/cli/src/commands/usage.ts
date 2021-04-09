import { cyan, green } from 'colorette'
import { version } from '../../package.json'
import { commands } from './index'

export function invoke (_args) {
  const sections: string[] = []

  sections.push(`Usage: ${cyan(`nu ${Object.keys(commands).join('|')} [args]`)}`)

  console.log(sections.join('\n\n') + '\n')
}

export const meta = {
  usage: 'nu help',
  description: 'Show help'
}
