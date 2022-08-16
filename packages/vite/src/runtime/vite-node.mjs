import { performance } from 'node:perf_hooks'
import { createError } from 'h3'
import { ViteNodeRunner } from 'vite-node/client'
import { $fetch } from 'ohmyfetch'
import consola from 'consola'
import { getViteNodeOptions } from './vite-node-shared.mjs'

const viteNodeOptions = getViteNodeOptions()

const runner = new ViteNodeRunner({
  root: viteNodeOptions.root, // Equals to Nuxt `srcDir`
  base: viteNodeOptions.base,
  async fetchModule (id) {
    return await $fetch('/module/' + encodeURI(id), {
      baseURL: viteNodeOptions.baseURL
    }).catch((err) => {
      if (!err.data) {
        throw err
      }
      // Legacy bundler behavior
      // return { code: '' }
      // Keys: id, plugin, message, name, stack, loc, pluginCode, frame
      const viteErrorObject = err.data.data || err.data
      const _error = createError({
        statusMessage: `[vite-node-runner] Cannot fetch module ${id}`,
        ...viteErrorObject
      })
      throw _error
    })
  }
})

let render

export default async (ssrContext) => {
  // Workaround for stub mode
  // https://github.com/nuxt/framework/pull/3983
  process.server = true

  // Invalidate cache for files changed since last rendering
  const invalidates = await $fetch('/invalidates', {
    baseURL: viteNodeOptions.baseURL
  })
  const updates = new Set()
  for (const key of invalidates) {
    if (runner.moduleCache.delete(key)) {
      updates.add(key)
    }
  }

  // Execute SSR bundle on demand
  const start = performance.now()
  render = render || (await runner.executeFile(viteNodeOptions.entryPath)).default
  if (updates.size) {
    const time = Math.round((performance.now() - start) * 1000) / 1000
    consola.success(`Vite server hmr ${updates.size} files`, time ? `in ${time}ms` : '')
  }

  const result = await render(ssrContext)
  return result
}
