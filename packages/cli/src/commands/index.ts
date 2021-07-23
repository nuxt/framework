export const commands = {
  dev: () => import('./dev'),
  build: () => import('./build'),
  prepare: () => import('./prepare'),
  usage: () => import('./usage')
}
