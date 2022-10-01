import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DevOnly',
  setup (_, { slots }) {
    if (process.dev) {
      return () => slots.default?.()
    }
    return () => null
  }
})
