import { resolve } from 'path'
import { testNitroBuild, setupTest, startServer, testNitroBehavior } from '../utils'

describe('nitro:preset:vercel', () => {
  const ctx = setupTest({ fixture: 'basic' })
  testNitroBuild(ctx, 'vercel')
  testNitroBehavior(ctx, async () => {
    const handle = await import(resolve(ctx.outDir, 'functions/node/server/index.js'))
      .then(r => r.default || r)
    await startServer(ctx, handle)
    return async ({ url }) => {
      const data = await ctx.fetch(url)
      return {
        data
      }
    }
  })
})
