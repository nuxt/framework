import { defineComponent, h, Suspense, Transition, nextTick } from 'vue'
import { RouteLocationNormalizedLoaded, RouterView } from 'vue-router'

import { generateRouteKey, RouterViewSlotProps, wrapInKeepAlive } from './utils'
import { useNuxtApp } from '#app'
import { _wrapIf } from '#app/components/utils'

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
      return h(RouterView, {}, {
        default: (routeProps: RouterViewSlotProps) => routeProps.Component &&
          _wrapIf(Transition, getTransitionProps(routeProps),
            wrapInKeepAlive(routeProps.route.meta.keepalive, h(Suspense, {
              onPending: () => nuxtApp.callHook('page:start', routeProps.Component),
              onResolve: () => {
                nextTick(() => nuxtApp.callHook('page:finish', routeProps.Component))
              }
            }, { default: () => h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) } as {}) }))).default()
      })
    }
  }
})

const defaultPageTransition = { name: 'page', mode: 'out-in' }
