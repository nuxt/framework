import { defineComponent, createElementBlock } from 'vue'

export default defineComponent({
  name: 'ServerPlaceholder',
  render (ctx: any) {
    const slot = ctx.$slots.fallback || ctx.$slots.placeholder
    if (slot) {
      const res = slot()
      return res.length === 1 ? res[0] : res
    }
    return createElementBlock('div')
  }
})
