import { resolveComponent, defineComponent, ref, h, createBlock, watch, onBeforeUnmount, createElementVNode } from 'vue'
import { withQuery } from 'ufo'
import { useNuxtApp } from '#app'

export const createServerRenderer = (name: string) => defineComponent({
  inheritAttrs: false,
  props: {
    tag: { type: String, default: 'div' }
  },
  setup (props, { attrs }) {
    return () => createBlock(props.tag, null, [h(resolveComponent(name), attrs)])
  }
})

interface RenderResult {
  state: Record<string, any>
  rendered: Array<{ html: string }>
  style?: string
}
export const createClientHandler = (name: string) => defineComponent({
  name: name + '-wrapper',
  inheritAttrs: false,
  props: {
    tag: { type: String, default: 'div' }
  },
  async setup (props, { attrs }) {
    const nuxtApp = useNuxtApp()
    const currentHTML = ref<string>('<!---->')

    const parserElement = document.createElement('div')
    const injectorElement = document.createElement('div')
    document.body.appendChild(injectorElement)
    onBeforeUnmount(() => document.body.removeChild(injectorElement))

    async function updateHTML (props: Record<string, any>) {
      const result = await $fetch<RenderResult>(withQuery('/__nuxt_render', {
        state: JSON.stringify({ ...nuxtApp.payload.state, error: undefined }),
        components: JSON.stringify([{ name, props }])
      }))

      // Update state on client-side
      for (const key in result.state) {
        nuxtApp.payload.state[key] = result.state[key]
      }

      // Update CSS
      parserElement.innerHTML = (result.style || '')
      const html = document.documentElement.innerHTML
      for (const child of parserElement.childNodes) {
        if (!(child instanceof HTMLElement)) { continue }
        if (html.includes(child.outerHTML)) { child.remove() }
      }
      injectorElement.innerHTML = parserElement.innerHTML

      // Update HTML
      currentHTML.value = result.rendered[0].html
    }

    watch(() => attrs, updateHTML, { deep: true })

    if (!nuxtApp.isHydrating) {
      await updateHTML(attrs)
    }

    return () => createElementVNode(props.tag, { innerHTML: currentHTML.value }, null, 8, ['innerHTML'])
  }
})
