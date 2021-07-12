import { resolve } from 'upath'
import { testNitroBuild, setupTest, testNitroBehavior, importModule } from './_utils'

describe('nitro:preset:lambda', () => {
  const ctx = setupTest()
  testNitroBuild(ctx, 'lambda')
  testNitroBehavior(ctx, async () => {
    const { handler } = await importModule(resolve(ctx.outDir, 'server/index.mjs'))
    return async ({ url: rawRelativeUrl, headers, method, body }) => {
      // creating new URL object to parse query easier
      const url = new URL(`https://example.com${rawRelativeUrl}`)
      const queryStringParameters = Object.fromEntries(url.searchParams.entries())
      const event = {
        path: url.pathname,
        headers: headers || {},
        method: method || 'GET',
        queryStringParameters,
        body: body || ''
      }
      const res = await handler(event)
      return {
        data: res.body
      }
    }
  })
})
