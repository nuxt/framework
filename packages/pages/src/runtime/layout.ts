import { defineAsyncComponent, defineComponent, h } from 'vue'

import layouts from '#build/layouts'

const cachedComponents = {}

export default defineComponent({
  props: {
    layout: {
      type: String,
      default: null
    }
  },
  setup (props, context) {
    return () => {
      const layout = props.layout
      if (!layouts[layout]) {
        return context.slots.default()
      }
      cachedComponents[layout] = cachedComponents[layout] || defineAsyncComponent({
        loader: layouts[layout],
        suspensible: false
      })
      return h(cachedComponents[layout], context, context.slots.default)
    }
  }
})
