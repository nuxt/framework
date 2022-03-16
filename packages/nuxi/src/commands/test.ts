import { resolve } from 'pathe'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'test',
    usage: 'npx nuxi test',
    description: 'Run tests'
  },
  async invoke (args) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'test'
    const rootDir = resolve(args._[0] || '.')
    const { runTests } = await importTestUtils()
    await runTests({
      rootDir
    })
  }
})

async function importTestUtils (): Promise<typeof import('@nuxt/test-utils')> {
  let err
  for (const pkg of ['@nuxt/test-utils-edge', '@nuxt/test-utils']) {
    try {
      return await import(pkg)
    } catch (_err) { err = _err }
  }
  console.error(err)
  throw new Error('`@nuxt/test-utils-edge` seems missing. Run `npm i -D @nuxt/test-utils-edge` or `yarn add -D @nuxt/test-utils-edge` to install.')
}
