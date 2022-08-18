import { defineComponent, createStaticVNode, computed, ref, watch } from 'vue'
import { debounce } from 'perfect-debounce'
import { hash } from 'ohash'
// eslint-disable-next-line import/no-restricted-paths
import type { NuxtIslandResponse } from '../../core/runtime/nitro/renderer'
import { useHead } from '#app'

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
    const hashId = computed(() => hash([props.props, props.context]))
    const html = ref('')

    async function fetchComponent () {
      const islandResponse = await $fetch<NuxtIslandResponse>(`${props.name}:${hashId.value}`, {
        baseURL: '/__nuxt_island',
        params: {
          ...props.context,
          props: props.props ? JSON.stringify(props.props) : undefined
        }
      })
      // TODO: Validate response
      injectHead(islandResponse.html)
      // Update html
      html.value = islandResponse.island?.html!
    }

    if (process.server) {
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
