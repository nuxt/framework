import { defineComponent, createElementBlock } from 'vue'

export default defineComponent({
  name: 'ServerPlaceholder',
  render (ctx: any) {
    const slot = ctx.$slots.fallback || ctx.$slots.placeholder
    if (slot) { return slot() }
    return createElementBlock('div')
  }
})
