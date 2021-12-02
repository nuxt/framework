import { defineComponent, createElementBlock } from 'vue'

export default defineComponent({
  name: 'Empty',
  render () {
    return createElementBlock('div')
  }
})
