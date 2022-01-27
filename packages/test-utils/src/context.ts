import { resolve } from 'path'
import defu from 'defu'
import { Nuxt, NuxtConfig } from '@nuxt/schema'
import type { Browser, LaunchOptions } from 'playwright'

export interface TestOptions {
  testDir: string
  fixture: string
  configFile: string
  rootDir: string
  buildDir: string
  nuxtConfig: NuxtConfig
  build: boolean
  setupTimeout: number
  waitFor: number
  browser: boolean
  browserOptions: {
    type: 'chromium' | 'firefox' | 'webkit'
    launch?: LaunchOptions
  }
  server: boolean
}

export interface TestContext {
  options: TestOptions
  nuxt?: Nuxt
  browser?: Browser
  url?: string
}

let currentContext: TestContext

export function createTestContext (options: Partial<TestOptions>): TestContext {
  const _options: Partial<TestOptions> = defu(options, {
    testDir: resolve(process.cwd(), 'test'),
    fixture: 'fixture',
    configFile: 'nuxt.config',
    setupTimeout: 60000,
    server: options.browser,
    build: options.browser || options.server,
    nuxtConfig: {},
    browserOptions: {
      type: 'chromium'
    }
  })

  return setTestContext({ options: _options as TestOptions })
}

export function useTestContext (): TestContext {
  if (!currentContext) {
    throw new Error('No context is available. (Forgot calling setup or createContext?)')
  }
  return currentContext
}

export function setTestContext (context: TestContext): TestContext {
  currentContext = context
  return currentContext
}
