import { NuxtOptions } from '@nuxt/schema'

export async function start (options: NuxtOptions, argv: any = {}) {
  const { startVitest } = await import('vitest/dist/node.js')
  const succeeded = await startVitest(
    argv._ || [],
    {
      root: options.rootDir,
      ...argv
    }
  )

  if (!succeeded) {
    process.exit()
  }
}
