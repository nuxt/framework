import { NuxtOptions } from '@nuxt/schema'

export default async function start (options: NuxtOptions, argv: any = {}) {
  const { startVitest } = await import('vitest/dist/node.js')
  const succeeded = await startVitest(
    argv._ || [],
    {
      root: options.rootDir,
      ...argv
    },
    {
      // TODO: forward more Vite options
      resolve: {
        alias: options.alias
      }
    }
  )

  if (!succeeded) {
    process.exit()
  }
}
