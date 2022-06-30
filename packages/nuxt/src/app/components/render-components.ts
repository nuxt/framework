import { createBlock, defineComponent, h, resolveComponent, Teleport } from 'vue'

export default defineComponent({
  props: {
    components: Array as () => Array<{ name: string, props?: Record<string, any> }>
  },
  async setup (props) {
    // TODO: https://github.com/vuejs/core/issues/6207
    await Promise.all(props.components.map(c => resolveComponent(c.name).__asyncLoader?.()))
    return () => props.components.map(
      (c, index) => createBlock(Teleport as any, { to: `render-target-${index}` }, [
        h(resolveComponent(c.name), c.props)
      ])
    )
  }
})
