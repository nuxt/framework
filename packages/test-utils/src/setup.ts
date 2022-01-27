import { createTestContext, setTestContext, TestOptions } from './context'
import { loadFixture, buildFixture } from './nuxt'
import { listen } from './server'
import { createBrowser } from './browser'

export function createTest (options: Partial<TestOptions>) {
  const ctx = createTestContext(options)

  const beforeEach = () => {
    setTestContext(ctx)
  }

  const afterEach = () => {
    setTestContext(undefined)
  }

  const afterAll = async () => {
    if (ctx.nuxt) {
      await ctx.nuxt.close()
    }
    if (ctx.browser) {
      await ctx.browser.close()
    }
  }

  const setup = async () => {
    if (ctx.options.fixture) {
      await loadFixture()
    }

    if (ctx.options.build) {
      await buildFixture()
    }

    if (ctx.options.server) {
      await listen()
    }

    if (ctx.options.waitFor) {
      await (new Promise(resolve => setTimeout(resolve, ctx.options.waitFor)))
    }

    if (ctx.options.browser) {
      await createBrowser()
    }
  }

  return {
    beforeEach,
    afterEach,
    afterAll,
    setup
  }
}

export async function setupVitest (options: Partial<TestOptions>) {
  const vitest = await import('vitest')
  const hooks = createTest(options)
  vitest.test('setup', hooks.setup, 60000)
  vitest.beforeEach(hooks.beforeEach)
  vitest.afterEach(hooks.afterEach)
  vitest.afterAll(hooks.afterAll)
}
