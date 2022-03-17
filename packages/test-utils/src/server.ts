import { resolve } from 'path'
import { execa } from 'execa'
import { getRandomPort, waitForPort } from 'get-port-please'
import { fetch as _fetch, $fetch as _$fetch, FetchOptions } from 'ohmyfetch'
import { useTestContext } from './context'

export interface ListenOptions {
  env?: Record<string, string>
}

export async function listen (options: ListenOptions = {}) {
  const ctx = useTestContext()
  const port = await getRandomPort()
  ctx.url = 'http://localhost:' + port
  ctx.serverProcess = execa('node', [
    // @ts-ignore
    resolve(ctx.nuxt.options.nitro.output.dir, 'server/index.mjs')
  ], {
    env: {
      ...ctx.options.env || {},
      ...options.env || {},
      PORT: String(port),
      NODE_ENV: 'test'
    }
  })
  await waitForPort(port, { retries: 8 })
}

export function terminateServerProcess () {
  const ctx = useTestContext()
  if (ctx.serverProcess) {
    ctx.serverProcess.kill()
  }
}

export async function restartServer (options: ListenOptions = {}) {
  terminateServerProcess()
  await listen(options)
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
