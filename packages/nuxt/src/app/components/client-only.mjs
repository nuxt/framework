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
  if (process.dev) {
    // override the component render, used only in dev to ensure devtools can retrieve the setupState
    component.render = (ctx, cache, props, state, data, options) => {
      return ctx.mounted$
        ? h(_render(ctx, cache, props, state, data, options))
        : h('div', ctx.$attrs)
    }
  }
  return defineComponent({
    ...component,
    setup (props, ctx) {
      const mounted$ = ref(false)
      onMounted(() => { mounted$.value = true })

      return Promise.resolve(setup?.(props, ctx) || {})
        .then((setupState) => {
          const render = setupState && typeof setupState === 'function' ? setupState : component.render
          return process.dev && typeof setupState !== 'function'
            ? { ...setupState, mounted$ }
            : () => {
                return mounted$.value
                // use Fragment to avoid oldChildren is null issue
                  ? h(Fragment, [render(props, ctx)])
                  : h('div', ctx.$attrs)
              }
        })
    }
  })
}
