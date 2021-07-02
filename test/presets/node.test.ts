import { resolve } from 'path'
import { testNitroBuild, startServer, setupTest, testNitroBehavior, importModule } from './_utils'

describe('nitro:preset:node', () => {
  const ctx = setupTest()
  testNitroBuild(ctx, 'node')
  testNitroBehavior(ctx, async () => {
    const { handle } = await importModule(resolve(ctx.outDir, 'server/index.mjs'))
    await startServer(ctx, handle)
    return async ({ url }) => {
      const data = await ctx.fetch(url)
      return {
        data
      }
    }
  })
})
