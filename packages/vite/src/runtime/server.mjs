import { ViteNodeRunner } from 'vite-node/client'

const runner = new ViteNodeRunner({
  root: process.cwd(),
  fetchModule (id) {
    return import('vite-node').then(r => r.fetchModule(id))
  }
})

export default runner.executeFile('__NUXT_SERVER_ENTRY__')
