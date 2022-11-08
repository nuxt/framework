import { ref, onMounted, defineComponent, createElementBlock, h, createElementVNode } from 'vue'

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

const cache = new WeakMap()

export function createClientOnly (component) {
  if (cache.has(component)) {
    return cache.get(component)
  }

  const clone = { ...component }

  if (clone.render) {
    // override the component render (non script setup component)
    clone.render = (ctx, ...args) => {
      if (ctx.mounted$) {
        const res = component.render(ctx, ...args)
        return (res.children === null || typeof res.children === 'string')
          ? createElementVNode(res.type, res.props, res.children, res.patchFlag, res.dynamicProps, res.shapeFlag)
          : h(res)
      } else {
        const slot = ctx.$slots.fallback || ctx.$slots.placeholder
        if (slot) {
          const res = slot()
          return res.length === 1 ? res[0] : res
        }
        return h('div', ctx.$attrs ?? ctx._.attrs)
      }
    }
  } else if (clone.template) {
    // handle runtime-compiler template
    clone.template = `
      <template v-if="mounted$">${component.template}</template>
      <template v-else-if="$slots.placeholder"><slot name="placeholder" /></template>
      <template v-else-if="$slots.fallback"><slot name="fallback" /></template>
      <template v-else><div></div></template>
    `
  }

  clone.setup = (props, ctx) => {
    const mounted$ = ref(false)
    onMounted(() => { mounted$.value = true })

    const slot = ctx.slots.fallback || ctx.slots.placeholder

    return Promise.resolve(component.setup?.(props, ctx) || {})
      .then((setupState) => {
        return typeof setupState !== 'function'
          ? { ...setupState, mounted$ }
          : (...args) => {
              if (mounted$.value) {
                const res = setupState(...args)
                return (res.children === null || typeof res.children === 'string')
                  ? createElementVNode(res.type, res.props, res.children, res.patchFlag, res.dynamicProps, res.shapeFlag)
                  : h(res)
              } else {
                if (slot) {
                  const res = slot()
                  return res.length === 1 ? res[0] : res
                }
                return h('div', ctx.attrs)
              }
            }
      })
  }

  cache.set(component, clone)

  return clone
}
