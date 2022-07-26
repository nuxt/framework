import { ref, onMounted, defineComponent, createElementBlock, h } from 'vue'

export default defineComponent({
  name: 'ClientOnly',
  // eslint-disable-next-line vue/require-prop-types
  props: ['fallback', 'placeholder', 'placeholderTag', 'fallbackTag'],
  setup (_, { slots }) {
    const mounted = ref(false)
    onMounted(() => { mounted.value = true })
    return (props) => {
      if (mounted.value) { return slots.default?.() }
      const slot = slots.fallback || slots.placeholder
      if (slot) { return slot() }
      const fallbackStr = props.fallback || props.placeholder || ''
      const fallbackTag = props.fallbackTag || props.placeholderTag || 'span'
      return createElementBlock(fallbackTag, null, fallbackStr)
    }
  }
})

export function createClientOnly (component) {
  const { setup } = component
  return {
    ...component,
    setup (props, ctx) {
      const res = setup?.(props, ctx) || {}

      const mounted = ref(false)
      onMounted(() => { mounted.value = true })

      return Promise.resolve(res)
        .then(() => ({ ...res, mounted }))
    },
    render (ctx, cache, props, state, data, options) {
      return state.mounted ? component.render(ctx, cache, props, state, data, options) : h('div', { class: options.$attrs.class, style: options.$attrs.style })
    }
  }
}
