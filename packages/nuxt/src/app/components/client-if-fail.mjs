import { defineComponent, createElementBlock, onErrorCaptured } from 'vue'

export default defineComponent({
  props: {
    uid: {
      type: String,
      required: true
    }
  },
  setup (props, ctx) {
    if (process.server) {
      const error = ref(false)

      onErrorCaptured((_, instance) => {
        error.value = true

        useState(`error_component_${props.uid}`, () => true)
        // modify ssr render to force render a simple div
        instance._.ssrRender = (_ctx, _push, _parent, _attrs) => {
          _push('<div></div>')
        }
        return false
      })
      return () => ctx.slots.default?.()
    }
    const mounted = ref(false)
    const ssrFailed = useState(`error_component_${props.uid}`)

    if (ssrFailed.value) {
      onMounted(() => { mounted.value = true })
    }
    return () => ssrFailed.value
      ? mounted.value
        ? ctx.slots.default?.()
        : ctx.slots.default?.().map(() => createElementBlock('div'))
      : ctx.slots.default?.()
  }
})
