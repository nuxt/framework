import { defineComponent, ref, onErrorCaptured, onBeforeUnmount } from 'vue'
import { useNuxtApp, useRouter } from '#app'

export default defineComponent({
  setup (_props, { slots, emit }) {
    const error = ref(null)
    const nuxtApp = useNuxtApp()

    onErrorCaptured((err) => {
      if (process.client && !nuxtApp.isHydrating) {
        emit('error', err)
        error.value = err
        return false
      }
    })

    const clearError = () => { error.value = null }
    const unregister = useRouter().afterEach(clearError)
    onBeforeUnmount(unregister)

    return () => error.value ? slots.error?.({ error, clearError }) : slots.default?.()
  }
})
