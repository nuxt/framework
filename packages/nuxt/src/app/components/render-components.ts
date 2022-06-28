import { createBlock, defineComponent, h, resolveComponent, Teleport } from 'vue'

export default defineComponent({
  props: {
    components: Array as () => Array<{ name: string, props?: Record<string, any> }>
  },
  setup (props) {
    return () => props.components.map(
      (c, index) => createBlock(Teleport as any, { to: `render-target-${index}` }, [
        h(resolveComponent(c.name), c.props)
      ])
    )
  }
})
