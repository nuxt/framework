import { defineComponent, h, inject, provide, Suspense, Transition } from 'vue'
import { RouteLocationNormalizedLoaded, RouterView } from 'vue-router'

import { generateRouteKey, RouterViewSlotProps, wrapInKeepAlive } from './utils'
import { useNuxtApp } from '#app'
import { _wrapIf } from '#app/components/utils'

const isNestedKey = Symbol('isNested')

export default defineComponent({
  name: 'NuxtPage',
  props: {
    pageKey: {
      type: [Function, String] as unknown as () => string | ((route: RouteLocationNormalizedLoaded) => string),
      default: null
    }
  },
  setup (props) {
    const nuxtApp = useNuxtApp()

    const isNested = inject(isNestedKey, false)
    provide(isNestedKey, true)

    return () => {
      return h(RouterView, {}, {
        default: (routeProps: RouterViewSlotProps) => routeProps.Component &&
            _wrapIf(Transition, routeProps.route.meta.pageTransition ?? defaultPageTransition,
              wrapInKeepAlive(routeProps.route.meta.keepalive,
                isNested && nuxtApp.isHydrating
                  // Include route children in parent suspense
                  ? h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) } as {})
                  : h(Suspense, {
                    onPending: () => nuxtApp.callHook('page:start', routeProps.Component),
                    onResolve: () => nuxtApp.callHook('page:finish', routeProps.Component)
                  }, { default: () => h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) } as {}) })
              )).default()
      })
    }
  }
})

const defaultPageTransition = { name: 'page', mode: 'out-in' }
