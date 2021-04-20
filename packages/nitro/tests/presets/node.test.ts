import { resolve } from 'path'
import { testNitroBuild, startServer, setupTest, testNitroBehavior } from '../utils'

describe('nitro:preset:node', () => {
  const ctx = setupTest({ fixture: 'basic' })
  testNitroBuild(ctx, 'node')
  testNitroBehavior(ctx, async () => {
    const { handle } = await import(resolve(ctx.outDir, 'server/index.js'))
    await startServer(ctx, handle)
    return async ({ url }) => {
      const data = await ctx.fetch(url)
      return {
        data
      }
    }
  })
})
