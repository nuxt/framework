import { asyncData } from '@nuxt/app'
import { withBase } from 'ufo'
export { default as NuxtContent } from './NuxtContent.vue'

function createFetch ({ baseURL } = { baseURL: null }) {
  return (input = '', opts: any = {}) => {
    if (baseURL) {
      input = withBase(input, baseURL)
    }
    const key = [opts.method || 'get', input].join('_')
    return asyncData(key, () => globalThis.$fetch(input, opts))
  }
}

export function useContent () {
  const getContent = createFetch({ baseURL: '/api/_content/get' })
  const listContent = createFetch({ baseURL: '/api/_content/list' })

  return {
    get: getContent,
    list: listContent
  }
}
