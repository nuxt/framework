import consola from 'consola'
import type { Consola } from 'consola'
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

export async function mockLogger (): Promise<Consola> {
  const mockedConsole: any = {}

  const fn = await mockFn()

  consola.mockTypes((type) => {
    mockedConsole[type] = mockedConsole[type] || fn
    return mockedConsole[type]
  })

  return mockedConsole
}
