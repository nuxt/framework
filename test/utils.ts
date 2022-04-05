import { getBrowser, url } from '@nuxt/test-utils'
import { expect } from 'vitest'

export async function renderPage (path = '/') {
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

  const consoleLogErrors = consoleLogs.filter(i => i.type === 'error')
  const consoleLogWarnings = consoleLogs.filter(i => i.type === 'warn')

  return {
    page,
    pageErrors,
    consoleLogs,
    consoleLogErrors,
    consoleLogWarnings
  }
}

export async function expectNoClientErrors (path: string) {
  const { pageErrors, consoleLogErrors, consoleLogWarnings } = await renderPage(path)
  expect(pageErrors).toEqual([])
  expect(consoleLogErrors).toEqual([])
  expect(consoleLogWarnings).toEqual([])
}
