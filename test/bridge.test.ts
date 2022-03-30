import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'
import { setup, $fetch, fetch } from '@nuxt/test-utils'

describe('fixtures:bridge', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/bridge', import.meta.url)),
    server: true
  })

  describe('pages', () => {
    it('render hello world', async () => {
      expect(await $fetch('/')).to.contain('Hello Vue 2!')
    })
    it('uses server Vue build', async () => {
      expect(await $fetch('/')).to.contain('Rendered on server: true')
    })
  })

  describe('navigate', () => {
    it('should redirect to index with navigateTo', async () => {
      const html = await $fetch('/navigate-to/')
      expect(html).toContain('Hello Vue 2!')
    })
  })

  describe('errors', () => {
    it('should render a JSON error page', async () => {
      const res = await fetch('/error', {
        headers: {
          accept: 'application/json'
        }
      })
      expect(res.status).toBe(500)
      expect(await res.json()).toMatchInlineSnapshot(`
      {
        "description": "",
        "message": "This is a custom error",
        "statusCode": 500,
        "statusMessage": "Internal Server Error",
        "url": "/error",
      }
    `)
    })

    // TODO:
    it.skip('should render a HTML error page', async () => {
      const res = await fetch('/error')
      expect(await res.text()).toContain('This is a custom error')
    })
  })
})
