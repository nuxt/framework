import { defineComponent, isRef, nextTick, onMounted, Ref, Transition, VNode } from 'vue'
import { _wrapIf } from './utils'
import { useRoute } from '#app'
// @ts-ignore
import layouts from '#build/layouts'

const defaultLayoutTransition = { name: 'layout', mode: 'out-in' }

export default defineComponent({
  props: {
    name: {
      type: [String, Boolean, Object] as unknown as () => string | false | Ref<string | false>,
      default: null
    }
  },
  setup (props, context) {
    const route = useRoute()

    return () => {
      const layout = (isRef(props.name) ? props.name.value : props.name) ?? route.meta.layout as string ?? 'default'

      const hasLayout = layout && layout in layouts
      if (process.dev && layout && !hasLayout && layout !== 'default') {
        console.warn(`Invalid layout \`${layout}\` selected.`)
      }

      const transitionProps = route.meta.layoutTransition ?? defaultLayoutTransition

      let vnode: VNode
      if (process.dev && process.client && transitionProps) {
        onMounted(() => {
          nextTick(() => {
            if (['#comment', '#text'].includes(vnode?.el?.nodeName)) {
              const filename = (vnode?.type as any).__file
              console.error(`\`${filename}\` does not have a single root node and will cause errors when navigating between routes.`)
            }
          })
        })
      }

      // We avoid rendering layout transition if there is no layout to render
      return _wrapIf(Transition, hasLayout && transitionProps,
        {
          default: () => {
            vnode = _wrapIf(layouts[layout], hasLayout, context.slots).default()
            return vnode
          }
        }
      ).default()
    }
  }
})
