import { createHead, renderHeadToString, useHead, HeadObject } from '@vueuse/head'
import { defineNuxtPlugin } from '@nuxt/app'
import { defineComponent } from '@vue/runtime-core'

type MappedProps<T extends Record<string, any>> = {
  [P in keyof T]: { type: () => T[P] }
}

const props: MappedProps<HeadObject> = {
  base: { type: Object },
  bodyAttrs: { type: Object },
  htmlAttrs: { type: Object },
  link: { type: Array },
  meta: { type: Array },
  script: { type: Array },
  style: { type: Array },
  title: { type: String }
}

const Head = defineComponent({
  props,
  setup (props, { slots }) {
    useHead(() => props)

    return () => slots.default?.()
  }
})

const createHeadComponent = (prop: keyof typeof props, isArray = false) =>
  defineComponent({
    setup (_props, { attrs, slots }) {
      useHead(() => ({
        [prop]: isArray ? [attrs] : attrs
      }))

      return () => slots.default?.()
    }
  })

const createHeadComponentFromSlot = (prop: keyof typeof props) =>
  defineComponent({
    setup (_props, { slots }) {
      useHead(() => ({
        [prop]: slots.default?.()[0]?.children
      }))

      return () => null
    }
  })

const Html = createHeadComponent('htmlAttrs')
const Body = createHeadComponent('bodyAttrs')
const Title = createHeadComponentFromSlot('title')
const Meta = createHeadComponent('meta', true)
const Link = createHeadComponent('link', true)
const Script = createHeadComponent('script', true)
const Style = createHeadComponent('style', true)

export default defineNuxtPlugin((nuxt) => {
  const head = createHead()

  nuxt.app.use(head)

  nuxt.app.component('NuxtHead', Head)
  nuxt.app.component('NuxtHtml', Html)
  nuxt.app.component('NuxtBody', Body)
  nuxt.app.component('NuxtTitle', Title)
  nuxt.app.component('NuxtMeta', Meta)
  nuxt.app.component('NuxtHeadLink', Link)
  nuxt.app.component('NuxtScript', Script)
  nuxt.app.component('NuxtStyle', Style)

  if (process.server) {
    nuxt.ssrContext.renderMeta = () => renderHeadToString(head)
  }
})
