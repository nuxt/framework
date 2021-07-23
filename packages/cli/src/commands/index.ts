export const commands = {
  dev: () => import('./dev'),
  build: () => import('./build'),
  usage: () => import('./usage')
}

export type Command = keyof typeof commands
