import type { TestHooks } from '../types'

export default function setupJest (create: (() => TestHooks)) {
  const hooks = create()

  // TODO: add globals existing check to provide better error message
  // @ts-expect-error jest types
  test('setup', hooks.setup, 60000)
  // @ts-expect-error jest types
  beforeEach(hooks.restoreContext)
  // @ts-expect-error jest types
  afterEach(hooks.unsetContext)
  // @ts-expect-error jest types
  afterAll(hooks.teardown)

  return hooks
}
