import { provide } from 'vue'
import { onGlobalSetup } from 'nuxt/app/composables'

export default () => {
  onGlobalSetup(() => {
    provide('test', { bar: 42 })
  })
}
