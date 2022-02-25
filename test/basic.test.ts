import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('fixtures:basic', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    server: true
  })

  describe('render index.html', async () => {
    const index = await $fetch('/')
    it('should render text', () => {
      expect(index).toContain('Hello Nuxt 3!')
    })
    it('should render <Head> components', () => {
      expect(index).toContain('<title>Basic fixture</title>')
    })
    it('should runtime config', () => {
      expect(index).toContain('Config: 123')
    })
    it('should import components', () => {
      expect(index).toContain('This is a custom component with a named export.')
    })
    // it('snapshot', () => {
    //   expect(index).toMatchInlineSnapshot()
    // })
  })
})
