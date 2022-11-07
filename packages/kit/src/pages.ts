import type { NuxtHooks } from '@nuxt/schema'
import { useNuxt } from './context'
import { isNuxt2 } from './compatibility'

export function extendPages (cb: NuxtHooks['pages:extend']) {
  const nuxt = useNuxt()
  nuxt.hook(isNuxt2(nuxt) ? 'build:extendRoutes' : 'pages:extend', cb)
}
