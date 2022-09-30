import { computed, defineComponent, h, isRef, nextTick, onMounted, Ref, Transition, VNode } from 'vue'
import { _wrapIf } from './utils'
import { useRouter } from '#app'
// @ts-ignore
import layouts from '#build/layouts'
// @ts-ignore
import { appLayoutTransition as defaultLayoutTransition } from '#build/nuxt.config.mjs'

// TODO: revert back to defineAsyncComponent when https://github.com/vuejs/core/issues/6638 is resolved
const LayoutLoader = defineComponent({
  props: {
    name: String,
    ...process.dev ? { hasTransition: Boolean } : {}
  },
  async setup (props, context) {
    let vnode: VNode

    if (process.dev && process.client) {
      onMounted(() => {
        nextTick(() => {
          if (props.name && ['#comment', '#text'].includes(vnode?.el?.nodeName)) {
            console.warn(`[nuxt] \`${props.name}\` layout does not have a single root node and will cause errors when navigating between routes.`)
          }
        })
      })
    }

    const LayoutComponent = await layouts[props.name]().then((r: any) => r.default || r)

    return () => {
      if (process.dev && process.client && props.hasTransition) {
        vnode = h(LayoutComponent, {}, context.slots)
        return vnode
      }
      return h(LayoutComponent, {}, context.slots)
    }
  }
})
export default defineComponent({
  props: {
    name: {
      type: [String, Boolean, Object] as unknown as () => string | false | Ref<string | false>,
      default: null
    }
  },
  setup (props, context) {
    // Use router.currentRoute.value instead because this must be changed synchronized with route
    const router = useRouter()
    const route = computed(() => router.currentRoute.value)
    const layout = computed(() => (isRef(props.name) ? props.name.value : props.name) ?? route.value.meta.layout as string ?? 'default')

    let vnode: VNode
    let _layout: string | false
    if (process.dev && process.client) {
      onMounted(() => {
        nextTick(() => {
          if (_layout && _layout in layouts && ['#comment', '#text'].includes(vnode?.el?.nodeName)) {
            console.warn(`[nuxt] \`${_layout}\` layout does not have a single root node and will cause errors when navigating between routes.`)
          }
        })
      })
    }

    return () => {
      const hasLayout = layout.value && layout.value in layouts
      if (process.dev && layout.value && !hasLayout && layout.value !== 'default') {
        console.warn(`Invalid layout \`${layout.value}\` selected.`)
      }

      const transitionProps = route.value.meta.layoutTransition ?? defaultLayoutTransition

      // We avoid rendering layout transition if there is no layout to render
      return _wrapIf(Transition, hasLayout && transitionProps, {
        default: () => _wrapIf(LayoutLoader, hasLayout && { key: layout.value, name: layout.value, hasTransition: !!transitionProps }, context.slots).default()
      }).default()
    }
  }
})
