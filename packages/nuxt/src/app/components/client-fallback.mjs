import { defineComponent, createElementBlock, getCurrentInstance, onErrorCaptured, createVNode } from 'vue'
import { isPromise, isArray, isString } from '@vue/shared'
import { ssrRenderVNode, ssrRenderAttrs } from 'vue/server-renderer'

/**
 * create buffer retrieved from https://github.com/vuejs/core/blob/9617dd4b2abc07a5dc40de6e5b759e851b4d0da1/packages/server-renderer/src/render.ts#L57
 */
function createBuffer () {
  let appendable = false
  const buffer = []
  return {
    getBuffer () {
      // Return static buffer and await on items during unroll stage
      return buffer
    },
    push (item) {
      const isStringItem = isString(item)
      if (appendable && isStringItem) {
        buffer[buffer.length - 1] += item
      } else {
        buffer.push(item)
      }
      appendable = isStringItem
      if (isPromise(item) || (isArray(item) && item.hasAsync)) {
        // promise, or child buffer with async, mark as async.
        // this allows skipping unnecessary await ticks during unroll stage
        buffer.hasAsync = true
      }
    }
  }
}

export default defineComponent({
  name: 'ClientFallback',
  inheritAttrs: false,
  props: {
    uid: {
      type: String
    },
    fallbackTag: {
      type: String,
      default: () => 'div'
    }
  },
  emits: ['ssr-error'],
  setup (props, ctx) {
    if (process.server) {
      const vm = getCurrentInstance()
      const ssrFailed = ref(false)

      onErrorCaptured(() => {
        useState(`${props.uid}`, () => true)
        ssrFailed.value = true
        ctx.emit('ssr-error')
        return false
      })

      try {
        const defaultSlot = ctx.slots.default?.()
        const ssrVNodes = createBuffer()

        for (let i = 0; i < defaultSlot.length; i++) {
          ssrRenderVNode(ssrVNodes.push, defaultSlot[i], vm)
        }

        return { ssrFailed, ssrVNodes }
      } catch (error) {
        // catch in dev
        useState(`${props.uid}`, () => true)
        ctx.emit('ssr-error')
        return { ssrFailed: true, ssrVNodes: [] }
      }
    }

    const mounted = ref(false)
    const ssrFailed = useState(`${props.uid}`)

    if (ssrFailed.value) {
      onMounted(() => { mounted.value = true })
    }

    return () => ssrFailed.value
      ? mounted.value
        ? ctx.slots.default?.()
        : createElementBlock(props.fallbackTag, ctx.attrs)
      : ctx.slots.default?.()
  },
  ssrRender (ctx, push) {
    if (ctx.ssrFailed) {
      push(`<${ctx.fallbackTag}${ssrRenderAttrs(ctx.$attrs)}></${ctx.fallbackTag}>`)
    } else {
      // push Fragment markup
      push('<!--[-->')
      push(ctx.ssrVNodes.getBuffer())
      push('<!--]-->')
    }
  }
})
