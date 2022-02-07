import { resolve } from 'path'
import { execa } from 'execa'
import { getPort } from 'get-port-please'
import { fetch as _fetch, $fetch as _$fetch, FetchOptions } from 'ohmyfetch'
import { useTestContext } from './context'

export async function listen () {
  const ctx = useTestContext()
  const port = await getPort({})
  ctx.url = 'http://localhost:' + port
  execa('node', [
    // @ts-expect-error TODO: TS2339: Property 'nitro' does not exist on type 'NuxtOptions'
    resolve(ctx.nuxt.options.nitro.output.dir, 'server/index.mjs')
  ], {
    env: {
      PORT: String(port)
    }
  })
  // TODO: Wait for listen event
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(ctx.url)
  await new Promise(resolve => setTimeout(resolve, 10000))
}

export function fetch (path: string, options?: any) {
  return _fetch(url(path), options)
}

export function $fetch (path: string, options?: FetchOptions) {
  return _$fetch(url(path), options)
}

export function url (path: string) {
  const ctx = useTestContext()
  if (!ctx.url) {
    throw new Error('url is not availabe (is server option enabled?)')
  }
  return ctx.url + path
}
