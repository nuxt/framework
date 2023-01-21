import type { NuxtHooks } from '@nuxt/schema'
import type { NitroRouteConfig } from 'nitropack'
import { defu } from 'defu'
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

export interface ExtendRouteRulesOptions {
  /**
   * Override route rule config
   *
   * @default false
   */
  override?: boolean
}

export function extendRouteRules (route: string, rule: NitroRouteConfig, options: ExtendRouteRulesOptions = {}) {
  const nuxt = useNuxt()
  for (const options of [nuxt.options, nuxt.options.nitro]) {
	  if (!options.routeRules) {
	    options.routeRules = {}
	  }
	  options.routeRules[route] = options.override
	    ? defu(rule, options.routeRules[route])
	    : defu(options.routeRules[route], rule)
  }
}
