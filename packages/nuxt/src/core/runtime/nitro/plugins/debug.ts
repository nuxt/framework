import { createDebugger } from 'hookable'
import type { NitroAppPlugin } from 'nitropack'

export default <NitroAppPlugin> function (nitro) {
  createDebugger(nitro.hooks, {
    tag: 'nitro app'
  })
}
