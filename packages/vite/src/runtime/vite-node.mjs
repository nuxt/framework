import { ViteNodeRunner } from 'vite-node/client'

const url = process.env.NUXT_VITE_SERVER_FETCH
const entry = process.env.NUXT_VITE_SERVER_ENTRY
const base = process.env.NUXT_VITE_SERVER_BASE
const root = process.env.NUXT_VITE_SERVER_ROOT

const runner = new ViteNodeRunner({
  root,
  base,
  async fetchModule (id) {
    return await $fetch(url, {
      method: 'POST',
      body: { id }
    })
  }
})

let render

export default async (ssrContext) => {
  render = render || (await runner.executeFile(entry)).default
  const result = await render(ssrContext)
  return result
}
