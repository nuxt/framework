import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('fixtures:extends', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/extends', import.meta.url)),
    server: true
  })

  describe('pages', () => {
    it('extends foo/pages/index.vue', async () => {
      const html = await $fetch('/')
      expect(html).toContain('Hello from extended page !')
    })

    it('extends bar/pages/override.vue over foo/pages/override.vue', async () => {
      const html = await $fetch('/override')
      expect(html).toContain('Extended page from bar')
    })
  })

  describe('middlewares', () => {
    it('extends foo/middleware/foo', async () => {
      const html = await $fetch('/with-middleware')
      expect(html).toContain('Injected by extended middleware')
    })

    it('extends bar/middleware/override.vue over foo/middleware/override.vue', async () => {
      const html = await $fetch('/with-middleware-override')
      expect(html).toContain('Injected by extended middleware from bar')
    })
  })
})
