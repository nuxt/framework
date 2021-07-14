import { RequestListener } from 'http'
import { resolve } from 'upath'
import destr from 'destr'
import consola from 'consola'
import { Listener, listen } from 'listhen'
import { $fetch } from 'ohmyfetch/node'
import execa from 'execa'
import { fixtureDir, resolveWorkspace } from '../utils'

const isCompat = Boolean(process.env.TEST_COMPAT)

export function importModule (path: string) {
  return import(path)
}

export interface TestContext {
  rootDir: string
  outDir: string
  fetch: (url: string) => Promise<any>
  server?: Listener
}

export interface AbstractRequest {
  url: string
  headers?: any
  method?: string
  body?: any
}

export interface AbstractResponse {
  data: string
}

export type AbstractHandler = (req: AbstractRequest) => Promise<AbstractResponse>

export function setupTest (preset: string): TestContext {
  const fixture = isCompat ? 'compat' : 'basic'
  const rootDir = fixtureDir(fixture)

  const ctx: TestContext = {
    rootDir,
    outDir: resolve(rootDir, '.output/preset/', preset),
    fetch: url => $fetch<any>(url, { baseURL: ctx.server.url })
  }

  beforeAll(() => {
    consola.wrapAll()
    consola.mock(() => jest.fn())
  })

  test('nitro build', async () => {
    const nuxtCLI = isCompat
      ? resolve(ctx.rootDir, 'node_modules/nuxt/bin/nuxt.js')
      : resolveWorkspace('packages/cli/bin/nuxt.js')

    await execa('node', [nuxtCLI, 'build', ctx.rootDir], {
      env: {
        NITRO_PRESET: preset,
        NITRO_OUTPUT_DIR: ctx.outDir,
        NODE_ENV: 'production'
      }
    })
  }, 60000)

  afterAll(async () => {
    if (ctx.server) {
      await ctx.server.close()
    }
  })

  return ctx
}

export async function startServer (ctx: TestContext, handle: RequestListener) {
  ctx.server = await listen(handle)
}

export function testNitroBehavior (_ctx: TestContext, getHandler: () => Promise<AbstractHandler>) {
  let handler

  test('setup handler', async () => {
    handler = await getHandler()
  })

  test('SSR Works', async () => {
    const { data } = await handler({ url: '/' })
    expect(data).toMatch('Hello Vue')
  }, 10000)

  test('API Works', async () => {
    const { data } = await handler({ url: '/api/hello' })
    expect(destr(data)).toEqual('Hello API')
  })
}
