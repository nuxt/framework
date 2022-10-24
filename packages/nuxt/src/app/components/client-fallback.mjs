import { defineComponent, createElementBlock, getCurrentInstance, onErrorCaptured } from 'vue'
import { ssrRenderVNode, ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer'
import { createBuffer } from './utils'

const clientFallback = process.server
  ? {
      name: 'ClientFallback',
      inheritAttrs: false,
      props: {
        uid: {
          type: String
        },
        fallbackTag: {
          type: String,
          default: () => 'div'
        },
        fallback: {
          type: String,
          default: () => ''
        },
        placeholder: {
          type: String
        },
        placeholderTag: {
          type: String
        }
      },
      emits: ['ssr-error'],
      setup (props, ctx) {
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
        } catch {
          // catch in dev
          useState(`${props.uid}`, () => true)
          ctx.emit('ssr-error')
          return { ssrFailed: true, ssrVNodes: [] }
        }
      },
      ssrRender (ctx, push, parent) {
        if (ctx.ssrFailed) {
          const { fallback, placeholder } = ctx.$slots
          if (fallback || placeholder) {
            ssrRenderSlot(ctx.$slots, fallback ? 'fallback' : 'placeholder', {}, null, push, parent)
          } else {
            const content = ctx.placeholder || ctx.fallback
            const tag = ctx.placeholderTag || ctx.fallbackTag
            push(`<${tag}${ssrRenderAttrs(ctx.$attrs)}>${content}</${tag}>`)
          }
        } else {
          // push Fragment markup
          push('<!--[-->')
          push(ctx.ssrVNodes.getBuffer())
          push('<!--]-->')
        }
      }
    }
  : {
      name: 'ClientFallback',
      inheritAttrs: false,
      props: {
        uid: {
          type: String
        },
        fallbackTag: {
          type: String,
          default: () => 'div'
        },
        fallback: {
          type: String,
          default: () => ''
        },
        placeholder: {
          type: String
        },
        placeholderTag: {
          type: String
        }
      },
      emits: ['ssr-error'],
      setup (props, ctx) {
        const mounted = ref(false)
        const ssrFailed = useState(`${props.uid}`)

        if (ssrFailed.value) {
          onMounted(() => { mounted.value = true })
        }

        return () => {
          if (mounted.value) { return ctx.slots.default?.() }
          if (ssrFailed.value) {
            const slot = ctx.slots.placeholder || ctx.slots.fallback
            if (slot) { return slot() }
            const fallbackStr = props.placeholder || props.fallback
            const fallbackTag = props.placeholderTag || props.fallbackTag
            return createElementBlock(fallbackTag, null, fallbackStr)
          }
          return ctx.slots.default?.()
        }
      }
    }

export default defineComponent(clientFallback)
