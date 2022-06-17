import { fileURLToPath } from 'node:url'
import { getBrowser, url, useTestContext } from '@nuxt/test-utils'
import { expect } from 'vitest'

export const fixturesDir = fileURLToPath(new URL(process.env.NUXT_TEST_DEV ? './fixtures-temp' : './fixtures', import.meta.url))

export async function renderPage (path = '/') {
  const ctx = useTestContext()
  if (!ctx.options.browser) {
    return
  }

  const browser = await getBrowser()
  const page = await browser.newPage({})
  const pageErrors = []
  const consoleLogs = []

  page.on('console', (message) => {
    consoleLogs.push({
      type: message.type(),
      text: message.text()
    })
  })
  page.on('pageerror', (err) => {
    pageErrors.push(err)
  })

  if (path) {
    await page.goto(url(path), { waitUntil: 'networkidle' })
  }

  return {
    page,
    pageErrors,
    consoleLogs
  }
}

export async function expectNoClientErrors (path: string) {
  const ctx = useTestContext()
  if (!ctx.options.browser) {
    return
  }

  const { pageErrors, consoleLogs } = await renderPage(path)

  const consoleLogErrors = consoleLogs.filter(i => i.type === 'error')
  const consoleLogWarnings = consoleLogs.filter(i => i.type === 'warn')

  expect(pageErrors).toEqual([])
  expect(consoleLogErrors).toEqual([])
  expect(consoleLogWarnings).toEqual([])
}

export async function expectWithPolling (
  get: () => Promise<string> | string,
  expected: string,
  retries = process.env.CI ? 50 : 30,
  delay = process.env.CI ? 300 : 100
) {
  let result: string | undefined
  for (let i = retries; i >= 0; i--) {
    result = await get()
    if (result === expected) {
      break
    }
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  expect(result).toEqual(expected)
}
