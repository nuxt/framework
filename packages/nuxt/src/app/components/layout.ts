import { defineComponent, isRef, nextTick, Ref, Transition } from 'vue'
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

      // We avoid rendering layout transition if there is no layout to render
      return _wrapIf(Transition, hasLayout && (transitionProps),
        {
          default: () => {
            const layoutComponent = _wrapIf(layouts[layout], hasLayout, context.slots).default()
            if (process.dev && process.client && hasLayout && transitionProps) {
              nextTick(() => {
                if (layoutComponent.el?.nodeName === '#comment') {
                  console.error(`Layout \`${layout}\` does not have a single root node and will cause errors when navigating between routes.`)
                }
              })
            }
            return layoutComponent
          }
        }
      ).default()
    }
  }
})
