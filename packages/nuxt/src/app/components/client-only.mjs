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

const cache = {}

export function createClientOnly (component) {
  if (cache[component.__name]) {
    return cache[component.__name]
  }

  const { setup, render: _render, template: _template } = component
  if (_render) {
    // override the component render (non script setup component)
    component.render = (ctx, ...args) => {
      return ctx.mounted$
        ? h(Fragment, ctx.props, [_render(ctx, ...args)])
        : h('div', ctx.$attrs ?? ctx._.attrs)
    }
  } else if (_template) {
    // handle runtime-compiler template
    component.template = `
      <template v-if="mounted$">${_template}</template>
      <template v-else><div></div></template>
    `
  }

  const definition = defineComponent({
    ...component,
    setup (props, ctx) {
      const mounted$ = ref(false)
      onMounted(() => { mounted$.value = true })

      return Promise.resolve(setup?.(props, ctx) || {})
        .then((setupState) => {
          return typeof setupState !== 'function'
            ? { ...setupState, mounted$ }
            : (...args) => {
                return mounted$.value
                  ? h(Fragment, null, [setupState(...args)])
                  : h('div', ctx.attrs)
              }
        })
    }
  })
  cache[component.__name] = definition
  return definition
}
