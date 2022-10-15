import { defineComponent, createElementBlock, onErrorCaptured } from 'vue'
import { ssrRenderAttrs } from 'vue/server-renderer'

export default defineComponent({
  props: {
    uid: {
      type: String,
      required: true
    }
  },
  emits: ['ssr-error'],
  setup (props, { slots, emit }) {
    if (process.server) {
      const error = ref(false)

      onErrorCaptured((_, instance) => {
        error.value = true

        useState(`error_component_${props.uid}`, () => true)
        // modify ssr render to force render a simple div
        instance._.ssrRender = (_ctx, _push, _parent, _attrs) => {
          _push(`<div${ssrRenderAttrs(_attrs)}></div>`)
        }
        emit('ssr-error', instance)
        return false
      })
      return () => slots.default?.()
    }
    const mounted = ref(false)
    const ssrFailed = useState(`error_component_${props.uid}`)

    if (ssrFailed.value) {
      onMounted(() => { mounted.value = true })
    }
    return ctx => ssrFailed.value
      ? mounted.value
        ? slots.default?.()
        : slots.default?.().map(() => createElementBlock('div', ctx.$attrs))
      : slots.default?.()
  }
})
