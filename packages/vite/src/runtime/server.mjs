import { ViteNodeRunner } from 'vite-node/client'

const entry = '__NUXT_SERVER_ENTRY__'
const serverURL = '__NUXT_SERVER_URL__'

const runner = new ViteNodeRunner({
  root: process.cwd(),
  base: '/_nuxt/', // TODO: read from config
  async fetchModule (id) {
    return await $fetch(serverURL, {
      method: 'POST',
      body: { id }
    })
  }
})

export default runner.executeFile(entry)
