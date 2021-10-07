import type { Argv } from 'mri'

const _rDefault = r => r.default || r

export const commands = {
  dev: () => import('./dev').then(_rDefault),
  build: () => import('./build').then(_rDefault),
  prepare: () => import('./prepare').then(_rDefault),
  usage: () => import('./usage').then(_rDefault),
  info: () => import('./info').then(_rDefault),
  init: () => import('./init').then(_rDefault),
  create: () => import('./init').then(_rDefault)
}

export type Command = keyof typeof commands

export const invokeCommand = async (command: Command, options: { nuxt?: any, rootDir?: any } = {}) => {
  const cmd = await commands[command]()
  await cmd.invoke(options)
}

export interface NuxtCommandMeta {
  name: string;
  usage: string;
  description: string;
  [key: string]: any;
}

export interface NuxtCommand {
  invoke(args: Argv): Promise<void> | void
  meta: NuxtCommandMeta
}

export function defineNuxtCommand (command: NuxtCommand): NuxtCommand {
  return command
}
