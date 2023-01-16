import { defineComponent, createStaticVNode, computed, watch } from 'vue'
import { debounce } from 'perfect-debounce'
import { hash } from 'ohash'
// eslint-disable-next-line import/no-restricted-paths
import type { NuxtIslandResponse } from '../../core/runtime/nitro/renderer'
import { useAsyncData, useHead, useNuxtApp } from '#app'

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

    function _fetchComponent () {
      // TODO: Validate response
      return $fetch<NuxtIslandResponse>(`/__nuxt_island/${props.name}:${hashId.value}`, {
        params: {
          ...props.context,
          props: props.props ? JSON.stringify(props.props) : undefined
        }
      })
    }

    const res = useAsyncData(
      `${props.name}:${hashId.value}`,
      async () => {
        nuxtApp[pKey] = nuxtApp[pKey] || {}
        if (!nuxtApp[pKey][hashId.value]) {
          nuxtApp[pKey][hashId.value] = _fetchComponent().finally(() => {
            delete nuxtApp[pKey][hashId.value]
          })
        }
        const res: NuxtIslandResponse = await nuxtApp[pKey][hashId.value]
        return {
          html: res.html,
          head: {
            link: res.head.link,
            style: res.head.style
          }
        }
      }, {
        immediate: process.server || !nuxtApp.isHydrating,
        default: () => ({
          html: '',
          head: {
            link: [], style: []
          }
        })
      }
    )

    useHead(() => res.data.value!.head)

    if (process.client) {
      watch(props, debounce(() => res.execute({ _initial: true }), 100))
    }

    await res

    return () => createStaticVNode(res.data.value!.html, 1)
  }
})
