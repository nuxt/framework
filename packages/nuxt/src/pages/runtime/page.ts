import { computed, defineComponent, h, provide, reactive, onMounted, nextTick, Suspense, Transition, KeepAliveProps, TransitionProps } from 'vue'
import type { DefineComponent, VNode } from 'vue'
import { RouteLocationNormalized, RouteLocationNormalizedLoaded, RouterView } from 'vue-router'
import type { RouteLocation } from 'vue-router'

import { generateRouteKey, RouterViewSlotProps, wrapInKeepAlive } from './utils'
import { useNuxtApp } from '#app'
import { _wrapIf } from '#app/components/utils'
// @ts-ignore
import { appPageTransition as defaultPageTransition, appKeepalive as defaultKeepaliveConfig } from '#build/nuxt.config.mjs'

export default defineComponent({
  name: 'NuxtPage',
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object] as any as () => boolean | TransitionProps,
      default: undefined
    },
    keepalive: {
      type: [Boolean, Object] as any as () => boolean | KeepAliveProps,
      default: undefined
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

    function getTransitionProps (routeProps: RouterViewSlotProps) {
      const metaTransition = routeProps.route.meta.pageTransition
      const propTransition = props.transition

      const onAfterLeave = () => {
        nuxtApp.callHook('page:transition:finish', routeProps.Component)
        if (metaTransition?.onAfterLeave) {
          metaTransition.onAfterLeave()
        }
        if (propTransition?.onAfterLeave) {
          propTransition.onAfterLeave()
        }
      }

      if (metaTransition === false || propTransition === false) {
        return false
      }
      return {
        ...defaultPageTransition,
        ...(typeof propTransition !== 'object' ? {} : propTransition),
        ...(typeof metaTransition !== 'object' ? {} : metaTransition),
        onAfterLeave
      }
    }

    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps: RouterViewSlotProps) => {
          if (!routeProps.Component) { return }

          const key = generateRouteKey(props.pageKey, routeProps)

          const done = nuxtApp.deferHydration()
          const hasExplicitTransitionProps = !!(props.transition ?? routeProps.route.meta.pageTransition ?? defaultPageTransition)

          return _wrapIf(Transition, getTransitionProps(routeProps),
            wrapInKeepAlive(props.keepalive ?? routeProps.route.meta.keepalive ?? (defaultKeepaliveConfig as KeepAliveProps), h(Suspense, {
              onPending: () => nuxtApp.callHook('page:start', routeProps.Component),
              onResolve: () => {
                nextTick(() => nuxtApp.callHook('page:finish', routeProps.Component).finally(done))
              }
            }, { default: () => h(Component, { key, routeProps, pageKey: key, hasTransition: hasExplicitTransitionProps } as {}) })
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

const Component = defineComponent({
  // TODO: Type props
  // eslint-disable-next-line vue/require-prop-types
  props: ['routeProps', 'pageKey', 'hasTransition'],
  setup (props) {
    // Prevent reactivity when the page will be rerendered in a different suspense fork
    // eslint-disable-next-line vue/no-setup-props-destructure
    const previousKey = props.pageKey
    // eslint-disable-next-line vue/no-setup-props-destructure
    const previousRoute = props.routeProps.route

    // Provide a reactive route within the page
    const route = {} as RouteLocation
    for (const key in props.routeProps.route) {
      (route as any)[key] = computed(() => previousKey === props.pageKey ? props.routeProps.route[key] : previousRoute[key])
    }

    provide('_route', reactive(route))

    let vnode: VNode
    if (process.dev && process.client && props.hasTransition) {
      onMounted(() => {
        nextTick(() => {
          if (['#comment', '#text'].includes(vnode?.el?.nodeName)) {
            const filename = (vnode?.type as any).__file
            console.warn(`[nuxt] \`${filename}\` does not have a single root node and will cause errors when navigating between routes.`)
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
