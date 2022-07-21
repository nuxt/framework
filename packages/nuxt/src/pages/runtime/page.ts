import { DefineComponent, defineComponent, h, inject, nextTick, provide, Suspense, Transition } from 'vue'
import { RouteLocationNormalized, RouteLocationNormalizedLoaded, RouterView } from 'vue-router'

import { generateRouteKey, RouterViewSlotProps, wrapInKeepAlive } from './utils'
import { useNuxtApp } from '#app'
import { _wrapIf } from '#app/components/utils'

const isNestedKey = Symbol('isNested')

export default defineComponent({
  name: 'NuxtPage',
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    route: {
      type: Object as () => RouteLocationNormalized
    },
    pageKey: {
      type: [Function, String] as unknown as () => string | ((route: RouteLocationNormalizedLoaded) => string),
      default: null
    }
  },
  setup (props, { attrs }) {
    const nuxtApp = useNuxtApp()

    const isNested = inject(isNestedKey, false)
    provide(isNestedKey, true)

    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps: RouterViewSlotProps) => {
          if (!routeProps.Component) { return false }

          const pageComponent = h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) } as {})
          const transitionProps = routeProps.route.meta.pageTransition ?? defaultPageTransition

          if (process.dev && process.client && transitionProps && pageComponent) {
            nextTick(() => {
              if (pageComponent.el?.nodeName === '#comment') {
                const filename = (pageComponent.type as any).__file
                console.error(`\`${filename}\` does not have a single root node and will cause errors when navigating between routes.`)
              }
            })
          }

          return _wrapIf(Transition, transitionProps,
            wrapInKeepAlive(routeProps.route.meta.keepalive,
              isNested && nuxtApp.isHydrating
                // Include route children in parent suspense
                ? pageComponent
                : h(Suspense, {
                  onPending: () => nuxtApp.callHook('page:start', routeProps.Component),
                  onResolve: () => nuxtApp.callHook('page:finish', routeProps.Component)
                }, { default: () => pageComponent })
            )).default()
        }
      })
    }
  }
}) as DefineComponent<{
  name?: string,
  route?: RouteLocationNormalized
  pageKey?: string | ((route: RouteLocationNormalizedLoaded) => string)
  [key: string]: any
}>

const defaultPageTransition = { name: 'page', mode: 'out-in' }
