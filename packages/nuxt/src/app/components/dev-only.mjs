import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DevOnly',
  setup (_, { slots }) {
    return () => slots.default?.()
  }
})
