import { ref, onMounted, defineComponent } from 'vue'
import { defineNuxtPlugin } from '#app'

export const ClientOnly = defineComponent({
  setup (_, { slots }) {
    const show = ref(false)
    onMounted(() => {
      show.value = true
    })
    return () => (show.value && slots.default ? slots.default() : null)
  }
})

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ClientOnly', ClientOnly)
})
