import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { isWindows } from 'std-env'

export default defineConfig({
  resolve: {
    alias: {
      '#app': resolve('./packages/nuxt/src/app/index.ts'),
      '@nuxt/test-utils': resolve('./packages/test-utils/src/index.ts')
    }
  },
  esbuild: {
    tsconfigRaw: '{}'
  },
  test: {
    globalSetup: 'test/setup.ts',
    testTimeout: isWindows ? 60000 : 10000,
    maxThreads: process.env.NUXT_TEST_DEV ? 1 : undefined,
    minThreads: process.env.NUXT_TEST_DEV ? 1 : undefined
  }
})
