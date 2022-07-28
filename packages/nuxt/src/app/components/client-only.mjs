import { ref, onMounted, defineComponent, createElementBlock, h, Fragment } from 'vue'

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
  return defineComponent({
    ...component,
    setup (props, ctx) {
      const mounted = ref(false)
      onMounted(() => { mounted.value = true })

      return Promise.resolve(setup?.(props, ctx) || {})
        .then((setupState) => {
          const render = setupState && typeof setupState === 'function' ? setupState : component.render
          return (_ctx, cache, _props, _, data, options) => {
            if (mounted.value) {
              if (process.dev) {
                return h(render(_ctx, cache, _props, setupState, data, options))
              }
              return h(Fragment, [render(props, ctx)])
            }
            return h('div', ctx.$attrs)
          }
        })
    }
  })
}
