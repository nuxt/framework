import consola from 'consola'
import { useTestContext } from './context'

export async function mockFn () {
  const { runner } = useTestContext().options

  if (runner === 'jest') {
    // @ts-ignore jest is not installed
    const jest = await import('jest')
    return jest.fn()
  }

  if (runner === 'vitest') {
    const vitest = await import('vitest')
    return vitest.vi.fn()
  }

  return () => {}
}

export async function mockLogger (): typeof consola {
  const mock = {}
  const fn = await mockFn()

  consola.mockTypes((type) => {
    mock[type] = mock[type] || fn
    return mock[type]
  })

  // @ts-ignore
  return mock
}
