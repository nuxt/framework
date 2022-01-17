import { ViteNodeRunner } from 'vite-node/client'

const entry = '__NUXT_SERVER_ENTRY__'
const serverURL = '__NUXT_SERVER_URL__'

const runner = new ViteNodeRunner({
  root: process.cwd(),
  fetchModule (id) {
    return $fetch(serverURL, {
      method: 'POST',
      body: { id }
    }).then(res => res.json())
  }
})

export default runner.executeFile(entry)
