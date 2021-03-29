import { App, VNode } from 'vue'
import { renderToString as render, SSRContext } from '@vue/server-renderer'

export async function renderToString (input: App | VNode, context?: SSRContext): Promise<string> {
  const result = await render(input, context)
  await context.nuxt.hooks.callHook('vue-renderer:done')
  return result
}
