import { computed, defineComponent, isRef, nextTick, h, onMounted, Ref, Transition, VNode } from 'vue'
import { _wrapIf } from './utils'
import { useRoute } from '#app'
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

    const LayoutComponent = await layouts[props.name]().then(r => r.default || r)

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
    const route = useRoute()
    const layout = computed(() => (isRef(props.name) ? props.name.value : props.name) ?? route.meta.layout as string ?? 'default')

    return () => {
      const hasLayout = layout.value && layout.value in layouts
      if (process.dev && layout.value && !hasLayout && layout.value !== 'default') {
        console.warn(`Invalid layout \`${layout.value}\` selected.`)
      }

      const transitionProps = route.meta.layoutTransition ?? defaultLayoutTransition

      // We avoid rendering layout transition if there is no layout to render
      return _wrapIf(Transition, hasLayout && transitionProps, {
        default: () => _wrapIf(LayoutLoader, hasLayout && { key: layout.value, name: layout.value, hasTransition: !!transitionProps }, context.slots).default()
      }).default()
    }
  }
})
