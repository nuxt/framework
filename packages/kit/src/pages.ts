import type { NuxtHooks } from '@nuxt/schema'
import type { NitroRouteConfig } from 'nitropack'
import { useNuxt } from './context'
import { isNuxt2 } from './compatibility'

export function extendPages (cb: NuxtHooks['pages:extend']) {
  const nuxt = useNuxt()
  if (isNuxt2(nuxt)) {
    // @ts-expect-error
    nuxt.hook('build:extendRoutes', cb)
  } else {
    nuxt.hook('pages:extend', cb)
  }
}

export function extendRouteRules (route: string, rule: NitroRouteConfig) {
  const nuxt = useNuxt()
  if (!nuxt.options.routeRules) {
    nuxt.options.routeRules = {}
  }
  nuxt.options.routeRules[route] = rule
  if (!nuxt.options.nitro.routeRules) {
    nuxt.options.nitro.routeRules = {}
  }
  nuxt.options.nitro.routeRules[route] = rule
}
