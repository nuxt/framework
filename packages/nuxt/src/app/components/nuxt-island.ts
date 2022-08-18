import { defineComponent, createStaticVNode, computed, ref, watch } from 'vue'
import { debounce } from 'perfect-debounce'
import { hash } from 'ohash'
// eslint-disable-next-line import/no-restricted-paths
import type { NuxtIslandResponse } from '../../core/runtime/nitro/renderer'
import { useHead, useNuxtApp } from '#app'

const pKey = '_islandPromises'

export default defineComponent({
  name: 'NuxtIsland',
  props: {
    name: {
      type: String,
      required: true
    },
    props: {
      type: Object,
      default: () => undefined
    },
    context: {
      type: Object,
      default: () => ({})
    }
  },
  async setup (props) {
    const nuxtApp = useNuxtApp()
    const hashId = computed(() => hash([props.name, props.props, props.context]))
    const html = ref('')

    function _fetchComponent () {
      // TODO: Validate response
      return $fetch<NuxtIslandResponse>(`${props.name}:${hashId.value}`, {
        baseURL: '/__nuxt_island',
        params: {
          ...props.context,
          props: props.props ? JSON.stringify(props.props) : undefined
        }
      })
    }

    async function fetchComponent () {
      nuxtApp[pKey] = nuxtApp[pKey] || {}
      if (!nuxtApp[pKey][hashId.value]) {
        nuxtApp[pKey][hashId.value] = _fetchComponent().finally(() => {
          delete nuxtApp[pKey][hashId.value]
        })
      }
      const res = await nuxtApp[pKey][hashId.value]
      injectHead(res.html)
      html.value = res.island?.html!
    }

    if (process.server || !nuxtApp.isHydrating) {
      await fetchComponent()
    }

    if (process.client) {
      watch(props, debounce(fetchComponent, 100))
    }

    return () => createStaticVNode(html.value, 1)
  }
})

// --- Internal ---

function injectHead (html: NuxtIslandResponse['html']) {
  const tags = extractTags(html.head.join(''))
  useHead({
    link: tags.filter(tag => tag.tag === 'link').map(tag => tag.attrs)
  })
}

// Tag parsing utils
// TOOD: Move to external library
const HTML_TAG_RE = /<(?<tag>[a-z]+)(?<rawAttrs> [^>]*)>/g
const HTML_TAG_ATTR_RE = /(?<name>[a-z]+)=(?<value>"[^"]*"|'[^']*'|[^ >]*)/g
function extractTags (html: string) {
  const tags: {tag: string, attrs: Record<string, string>}[] = []
  for (const tagMatch of html.matchAll(HTML_TAG_RE)) {
    const attrs = {} as Record<string, string>
    for (const attraMatch of tagMatch.groups!.rawAttrs.matchAll(HTML_TAG_ATTR_RE)) {
      attrs[attraMatch.groups!.name] = attraMatch.groups!.value
    }
    tags.push({ tag: tagMatch.groups!.tag, attrs })
  }
  return tags
}
