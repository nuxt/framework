import type { Argv } from 'mri'
import { cyan } from 'colorette'
import { commands } from './index'

export function invoke (_args: Argv) {
  const sections: string[] = []

  sections.push(`Usage: ${cyan(`nu ${Object.keys(commands).join('|')} [args]`)}`)

  console.log(sections.join('\n\n') + '\n')
}

export const meta = {
  usage: 'nu help',
  description: 'Show help'
}
