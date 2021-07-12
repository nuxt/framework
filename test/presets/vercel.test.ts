import { resolve } from 'upath'
import { testNitroBuild, setupTest, startServer, testNitroBehavior, importModule } from './_utils'

describe('nitro:preset:vercel', () => {
  const ctx = setupTest()
  testNitroBuild(ctx, 'vercel')
  testNitroBehavior(ctx, async () => {
    const handle = await importModule(resolve(ctx.outDir, 'functions/node/server/index.mjs'))
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
