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

    function getTransitionProps (routeProps: RouterViewSlotProps) {
      const metaTransition = routeProps.route.meta.pageTransition
      const onAfterLeave = () => {
        nuxtApp.callHook('page:transition:finish', routeProps.Component)
      }

      if (typeof metaTransition === 'boolean') {
        return metaTransition && {
          ...defaultPageTransition,
          onAfterLeave
        }
      } else {
        return {
          ...defaultPageTransition,
          ...(metaTransition || {}),
          onAfterLeave
        }
      }
    }

    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps: RouterViewSlotProps) => routeProps.Component &&
            _wrapIf(Transition, getTransitionProps(routeProps),
              wrapInKeepAlive(routeProps.route.meta.keepalive,
                isNested && nuxtApp.isHydrating
                  // Include route children in parent suspense
                  ? h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) } as {})
                  : h(Suspense, {
                    onPending: () => nuxtApp.callHook('page:start', routeProps.Component),
                    onResolve: () => {
                      nextTick(() => nuxtApp.callHook('page:finish', routeProps.Component))
                    }
                  }, { default: () => h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) } as {}) })
              )).default()
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
