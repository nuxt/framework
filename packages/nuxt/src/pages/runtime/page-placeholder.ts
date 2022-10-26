import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NuxtPage',
  setup (_, props) {
    if (process.dev) {
      console.warn('Please create `pages/index.vue` to use `<NuxtPage>`')
    }
    return () => props.slots.default?.()
  }
})
