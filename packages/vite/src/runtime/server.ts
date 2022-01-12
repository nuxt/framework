import { ViteNodeRunner } from 'vite-node/client'

const runner = new ViteNodeRunner({
  root: process.cwd(),
  fetchModule (id) {
    // TODO:
    return undefined
  }
})

runner.run('/')
