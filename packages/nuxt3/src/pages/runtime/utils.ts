import { VNode } from 'vue'
import { RouteLocationMatched, RouteLocationNormalizedLoaded } from 'vue-router'

const interpolatePath = (route: RouteLocationNormalizedLoaded, match: RouteLocationMatched) => {
  return match.path.replace(/:\w+/g, r => route.params[r.slice(1)].toString() || r)
}

export const getKey = (override: string | ((route: RouteLocationNormalizedLoaded) => string), route: RouteLocationNormalizedLoaded, Component: VNode) => {
  const matchedRoute = route.matched.find(m => m.components.default === Component.type)
  const source = override ?? matchedRoute?.meta.key ?? interpolatePath(route, matchedRoute)
  return typeof source === 'function' ? source(route) : source
}
