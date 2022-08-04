import { computed, DefineComponent, defineComponent, h, inject, nextTick, onMounted, provide, reactive, Suspense, Transition, VNode } from 'vue'
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
          if (!routeProps.Component) { return }

          const key = generateRouteKey(props.pageKey, routeProps)
          const transitionProps = routeProps.route.meta.pageTransition ?? defaultPageTransition

          return _wrapIf(Transition, transitionProps,
            wrapInKeepAlive(routeProps.route.meta.keepalive, isNested && nuxtApp.isHydrating
            // Include route children in parent suspense
              ? h(Component, { key, routeProps, pageKey: key, hasTransition: !!transitionProps } as {})
              : h(Suspense, {
                onPending: () => nuxtApp.callHook('page:start', routeProps.Component),
                onResolve: () => nuxtApp.callHook('page:finish', routeProps.Component)
              }, { default: () => h(Component, { key, routeProps, pageKey: key, hasTransition: !!transitionProps } as {}) })
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

const Component = defineComponent({
  // eslint-disable-next-line vue/require-prop-types
  props: ['routeProps', 'pageKey', 'hasTransition'],
  setup (props) {
    // Prevent reactivity when the page will be rerendered in a different suspense fork
    const previousKey = props.pageKey
    const previousRoute = props.routeProps.route

    // Provide a reactive route within the page
    const route = {}
    for (const key in props.routeProps.route) {
      route[key] = computed(() => previousKey === props.pageKey ? props.routeProps.route[key] : previousRoute[key])
    }

    provide('_route', reactive(route))

    let vnode: VNode
    if (process.dev && process.client && props.hasTransition) {
      onMounted(() => {
        nextTick(() => {
          if (['#comment', '#text'].includes(vnode?.el?.nodeName)) {
            const filename = (vnode?.type as any).__file
            console.error(`\`${filename}\` does not have a single root node and will cause errors when navigating between routes.`)
          }
        })
      })
    }

    return () => {
      if (process.dev && process.client) {
        vnode = h(props.routeProps.Component)
        return vnode
      }

      return h(props.routeProps.Component)
    }
  }
})
