import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
// TODO: Should import from @nuxt/test-utils
import { setupVitest, $fetch } from '../../packages/test-utils/src'

const examplesDir = fileURLToPath(new URL('../../examples', import.meta.url))

describe('examples:hello-world', async () => {
  await setupVitest({
    rootDir: resolve(examplesDir, 'hello-world'),
    server: true
  })

  it('Render hello world test', async () => {
    expect(await $fetch('/')).to.contain('Hello Nuxt 3!')
  })
})
