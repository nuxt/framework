import consola from 'consola'
import { useTestContext } from './context'

const mockFnVitest = async () => {
  const vitest = await import('vitest')
  return vitest.vi.fn()
}

const mockFnJest = async () => {
  const jest = await import('jest')
  return jest.fn()
}

export const mockFnMaps = {
  jest: mockFnJest,
  vitest: mockFnVitest
}

export async function mockFn () {
  const { runner } = useTestContext().options

  return await mockFnMaps[runner]()
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
