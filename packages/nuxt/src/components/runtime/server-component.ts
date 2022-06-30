import { resolveComponent, defineComponent, ref, h, Fragment, createStaticVNode, createBlock, watch } from 'vue'
import { withQuery } from 'ufo'
import { useNuxtApp } from '#app'

export const createServerRenderer = (name: string) => defineComponent({
  inheritAttrs: false,
  setup (_props, { attrs }) {
    return () => createBlock(Fragment, null, [h(resolveComponent(name), attrs)])
  }
})

interface RenderResult { state: Record<string, any>, rendered: Array<{ html: string }> }
export const createClientHandler = (name: string) => defineComponent({
  name: name + '-wrapper',
  inheritAttrs: false,
  async setup (_props, { attrs }) {
    const nuxtApp = useNuxtApp()
    const currentHTML = ref<string>('<!---->')

    async function updateHTML (props: Record<string, any>) {
      const result = await $fetch<RenderResult>(withQuery('/__nuxt_render', {
        state: JSON.stringify({ ...nuxtApp.payload.state, error: undefined }),
        components: JSON.stringify([{ name, props }])
      }))
      currentHTML.value = result.rendered[0].html
    }

    watch(() => attrs, updateHTML, { deep: true })

    if (!nuxtApp.isHydrating) {
      await updateHTML(attrs)
    }

    return () => createBlock(Fragment, null, [createStaticVNode(currentHTML.value, 1)])
  }
})
