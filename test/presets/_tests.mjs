import { resolve } from 'path'
import { pathToFileURL } from 'url'
import destr from 'destr'
import { listen } from 'listhen'
import { $fetch } from 'ohmyfetch/node'
import execa from 'execa'
import { expect } from 'chai'
import { fixtureDir, resolveWorkspace } from '../utils.mjs'

const isCompat = Boolean(process.env.TEST_COMPAT)

export function importModule (path) {
  return import(pathToFileURL(path).href)
}

export function setupTest (preset) {
  const fixture = isCompat ? 'compat' : 'basic'
  const rootDir = fixtureDir(fixture)
  const buildDir = resolve(rootDir, '.nuxt-' + preset)

  const ctx = {
    rootDir,
    outDir: resolve(buildDir, 'output'),
    fetch: url => $fetch(url, { baseURL: ctx.server.url })
  }

  it('nitro build', async () => {
    const nuxtCLI = isCompat
      ? resolve(ctx.rootDir, 'node_modules/nuxt/bin/nuxt.js')
      : resolveWorkspace('packages/cli/bin/nuxt.js')

    await execa('node', [nuxtCLI, 'build', ctx.rootDir], {
      env: {
        NITRO_PRESET: preset,
        NITRO_BUILD_DIR: buildDir,
        NITRO_OUTPUT_DIR: ctx.outDir,
        NODE_ENV: 'production'
      }
    })
  }).timeout(60000)

  after('Cleanup', async () => {
    if (ctx.server) {
      await ctx.server.close()
    }
  })

  return ctx
}

export async function startServer (ctx, handle) {
  ctx.server = await listen(handle)
}

export function testNitroBehavior (ctx, getHandler) {
  let handler

  it('setup handler', async () => {
    handler = await getHandler()
  })

  it('SSR Works', async () => {
    const { data } = await handler({ url: '/' })
    expect(data).to.have.string('Hello Vue')
  })

  it('API Works', async () => {
    const { data } = await handler({ url: '/api/hello' })
    expect(destr(data)).to.have.string('Hello API')
  })
}
