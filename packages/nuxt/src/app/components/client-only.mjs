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
  const { setup, render: _render } = component
  if (component.render) {
    // override the component render (non <script setup> component)
    component.render = (ctx, cache, props, state, data, options) => {
      return state.mounted$
        ? h(Fragment, [_render(ctx, cache, props, state, data, options)])
        : h('div', ctx.$attrs ?? ctx._.attrs)
    }
  }
  return defineComponent({
    ...component,
    setup (props, ctx) {
      const mounted$ = ref(false)
      onMounted(() => { mounted$.value = true })

      return Promise.resolve(setup?.(props, ctx) || {})
        .then((setupState) => {
          return typeof setupState !== 'function'
            ? { ...setupState, mounted$ }
            : () => {
                return mounted$.value
                // use Fragment to avoid oldChildren is null issue
                  ? h(Fragment, [setupState(props, ctx)])
                  : h('div', ctx.attrs)
              }
        })
    }
  })
}
