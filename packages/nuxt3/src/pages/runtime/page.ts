import { defineComponent, h, Suspense, Transition } from 'vue'
import { RouteLocationNormalizedLoaded, RouterView } from 'vue-router'

import { getKey, wrapIf, wrapInKeepAlive } from './utils'
import { useNuxtApp } from '#app'

type InstanceOf<T> = T extends new (...args: any[]) => infer R ? R : never
type RouterViewSlotProps = Parameters<InstanceOf<typeof RouterView>['$slots']['default']>[0]

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

    return () => {
      return h(RouterView, {}, {
        default: ({ Component, route }: RouterViewSlotProps) => Component &&
            wrapIf(Transition, route.meta.pageTransition ?? defaultPageTransition,
              wrapInKeepAlive(route.meta.keepalive, h(Suspense, {
                onPending: () => nuxtApp.callHook('page:start', Component),
                onResolve: () => nuxtApp.callHook('page:finish', Component)
              }, { default: () => h(Component, { key: getKey(props.pageKey, route, Component) }) }))).default()
      })
    }
  }
})

const defaultPageTransition = { name: 'page', mode: 'out-in' }
