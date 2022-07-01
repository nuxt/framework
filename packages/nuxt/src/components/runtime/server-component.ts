import { resolveComponent, defineComponent, ref, h, createBlock, watch, createElementVNode } from 'vue'
import { withQuery } from 'ufo'
import { useNuxtApp, ComponentRenderResult } from '#app'

export const createServerRenderer = (name: string) => defineComponent({
  inheritAttrs: false,
  props: {
    tag: { type: String, default: 'div' }
  },
  setup (props, { attrs }) {
    return () => createBlock(props.tag, null, [h(resolveComponent(name), attrs)])
  }
})

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

    async function updateHTML (props: Record<string, any>) {
      const result = await $fetch<ComponentRenderResult>(withQuery('/__nuxt_render', {
        state: JSON.stringify({ ...nuxtApp.payload.state, error: undefined }),
        components: JSON.stringify([{ name, props }])
      }))

      // Update state on client-side
      for (const key in result.state) {
        nuxtApp.payload.state[key] = result.state[key]
      }

      // Update CSS
      parserElement.innerHTML = (result.style || '') + (result.script || '')
      const html = document.documentElement.innerHTML
      for (const child of parserElement.childNodes) {
        if (!(child instanceof HTMLElement)) { continue }
        if (!html.includes(child.outerHTML)) {
          document.head.appendChild(child)
        }
      }

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
