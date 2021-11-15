import { ref, onMounted, defineComponent } from 'vue'

export default defineComponent({
  name: 'ClientOnly',
  setup (_, { slots, attrs }) {
    const mounted = ref(false)
    onMounted(() => { mounted.value = true })
    return () => (
      mounted.value
        ? slots.default?.()
        : (slots.fallback || slots.placeholder)?.() || attrs.fallback || attrs.placeholder
    )
  }
})
