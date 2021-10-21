import path from 'pathe'
import { setupTest, startServer, testNitroBehavior, importModule } from './_tests.mjs'
import fs from 'fs-extra'

describe('nitro:preset:vercel', () => {
  const ctx = setupTest('vercel')
  testNitroBehavior(ctx, async () => {
    const index = path.resolve(ctx.outDir, 'nuxt-server/index.mjs')
    await fs.copyFile(path.join(ctx.outDir, 'server', 'pages', 'index.mjs'), index)

    const handle = await importModule(index)
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
