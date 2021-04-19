import { asyncData } from '@nuxt/app'

export { default as NuxtContent } from './content.vue'

export function useContent (slug, ext = 'md') {
  return asyncData(`content:${slug}`, () => globalThis.$fetch(`/api/content?slug=${slug}&ext=${ext}`))
}
