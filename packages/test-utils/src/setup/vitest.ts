import type { TestHooks } from '../types'

export default async function setupVitest (create: (() => TestHooks)) {
  const vitest = await import('vitest')

  // When running in watch mode, `runOnce` will preserve the state across runs
  // so we can reuse the server for much faster test reruns
  const hooks = await vitest.runOnce(create)

  if (vitest.isFirstRun()) {
    vitest.beforeAll(hooks.setup, 60000)
  }
  if (!vitest.isWatchMode()) {
    vitest.afterAll(hooks.afterAll)
  }

  vitest.beforeEach(hooks.beforeEach)
  vitest.afterEach(hooks.afterEach)

  return hooks
}
