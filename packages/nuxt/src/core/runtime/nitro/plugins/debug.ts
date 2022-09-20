import type { NitroAppPlugin } from 'nitropack'

const wrapName = (event: string) => process.server ? `[nitro] ${event}` : event

export default <NitroAppPlugin> function (nitro) {
  nitro.hooks.beforeEach(({ name }) => {
    console.time(wrapName(name))
  })

  nitro.hooks.afterEach(({ name }) => {
    console.timeEnd(wrapName(name))
  })
}
