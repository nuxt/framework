import { fileURLToPath } from 'node:url'
import { isWindows } from 'std-env'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { expectNoClientErrors, renderPage } from './utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  server: true,
  browser: true,
  setupTimeout: (isWindows ? 240 : 120) * 1000
})

describe('test basic config', () => {
  it('expect render page without any error or logs', async () => {
    await expectNoClientErrors('/')
  })

  it('test HelloWorld.vue', async () => {
    const html = await $fetch('/')
    const { page } = await renderPage('/')

    console.log({ html })

    expect(html).toContain('<div id="hello-world">hello, Helloworld.vue here ! </div>')
    expect(await page.locator('body').innerHTML()).toContain('<div id="hello-world">hello, Helloworld.vue here ! </div>')
  })

  it('test Name.ts', async () => {
    const html = await $fetch('/')
    const { page } = await renderPage('/')

    expect(html).toContain('<div id="name">I am the Name.ts component</div>')
    expect(await page.locator('body').innerHTML()).toContain('<div id="name">I am the Name.ts component</div>')
  })

  it('test ShowTemplate.ts', async () => {
    const html = await $fetch('/')
    const { page } = await renderPage('/')

    expect(html).toContain('<div id="show-template">Hello my name is : John, i am defined by ShowTemplate.vue and my template is retrieved from the API</div>')
    expect(await page.locator('body').innerHTML()).toContain('<div id="show-template">Hello my name is : John, i am defined by ShowTemplate.vue and my template is retrieved from the API</div>')
  })

  it('test Interactive component.ts', async () => {
    const html = await $fetch('/')
    const { page } = await renderPage('/')

    expect(html).toContain('I am defined by Interactive in the setup of App.vue. My full component definition is retrieved from the api')
    expect(await page.locator('#interactive').innerHTML()).toContain('I am defined by Interactive in the setup of App.vue. My full component definition is retrieved from the api')
    const button = page.locator('#inc-interactive-count')
    await button.click()
    const count = page.locator('#interactive-count')
    expect(await count.innerHTML()).toBe('1')
  })
})
