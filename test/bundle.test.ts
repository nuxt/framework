import { fileURLToPath } from 'node:url'
import fsp from 'node:fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { execaCommand } from 'execa'
import { globby } from 'globby'
import { join } from 'pathe'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(rootDir, '.output/public')
const serverDir = join(rootDir, '.output/server')

describe('minimal nuxt application', () => {
  beforeAll(async () => {
    await execaCommand('yarn nuxi build', {
      cwd: rootDir
    })
  }, 120 * 1000)

  it('default client bundle size', async () => {
    const { files, size } = await measure('**/*.js', publicDir)
    expect(size).toBeLessThan(110000)
    // expect(size).toMatchInlineSnapshot('106916')
    expect(files.map(f => f.replace(/\..*\.js/, '.js'))).toMatchInlineSnapshot(`
      [
        "_nuxt/entry.js",
        "_nuxt/error-404.js",
        "_nuxt/error-500.js",
        "_nuxt/error-component.js",
      ]
    `)
  })

  it('default server bundle size', async () => {
    const serverBundle = await measure(['**/*.mjs', '!node_modules'], serverDir)
    expect(serverBundle.size).toBeLessThan(120000)
    // expect(serverBundle.size).toMatchInlineSnapshot('114018')

    const modules = await measure('node_modules/**/*', serverDir)
    expect(modules.size).toBeLessThan(2700000)
    // expect(modules.size).toMatchInlineSnapshot('2637251')

    const packages = modules.files
      .filter(m => m.endsWith('package.json'))
      .map(m => m.replace('/package.json', '').replace('node_modules/', ''))
      .sort()
    expect(packages).toMatchInlineSnapshot(`
      [
        "@babel/parser",
        "@vue/compiler-core",
        "@vue/compiler-dom",
        "@vue/compiler-ssr",
        "@vue/reactivity",
        "@vue/runtime-core",
        "@vue/runtime-dom",
        "@vue/server-renderer",
        "@vue/shared",
        "buffer-from",
        "cookie-es",
        "defu",
        "destr",
        "estree-walker",
        "h3",
        "hookable",
        "node-fetch-native",
        "ohash",
        "ohmyfetch",
        "pathe",
        "radix3",
        "scule",
        "source-map",
        "source-map-support",
        "ufo",
        "unctx",
        "unenv",
        "unstorage",
        "vue",
        "vue-bundle-renderer",
      ]
    `)
  })
})

async function measure (pattern: string | string[], rootDir: string) {
  const files = await globby(pattern, { cwd: rootDir })
  let size = 0
  for (const file of files) {
    const stats = await fsp.stat(join(rootDir, file))
    size += stats.size
  }
  return { files, size }
}
