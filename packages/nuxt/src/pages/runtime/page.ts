import { computed, DefineComponent, defineComponent, h, inject, nextTick, provide, reactive, Suspense, Transition } from 'vue'
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
          const pageComponent = h(Component, { key, routeProps, pageKey: key } as {})
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
            wrapInKeepAlive(routeProps.route.meta.keepalive, isNested && nuxtApp.isHydrating
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

const Component = defineComponent({
  // eslint-disable-next-line vue/require-prop-types
  props: ['routeProps', 'pageKey'],
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
    return () => h(props.routeProps.Component)
  }
})
