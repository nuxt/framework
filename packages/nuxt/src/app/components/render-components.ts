import { createBlock, defineComponent, h, Teleport } from 'vue'

// @ts-ignore
import * as islandComponents from '#build/components-islands.mjs'

export default defineComponent({
  props: {
    components: Array as () => Array<{ name: string, props?: Record<string, any> }>
  },
  async setup (props) {
    // TODO: https://github.com/vuejs/core/issues/6207
    await Promise.all(props.components.map((c) => {
      const component = islandComponents[c.name]
      return component && typeof component === 'object' && component.__asyncLoader?.()
    }))
    return () => props.components.map(
      (c, index) => createBlock(Teleport as any, { to: `render-target-${index}` }, [
        h(islandComponents[c.name] || 'span', c.props)
      ])
    )
  }
})
