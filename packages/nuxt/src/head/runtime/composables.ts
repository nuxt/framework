import type { HeadEntryOptions, UseHeadInput } from '@vueuse/head'
import type { HeadAugmentations } from '@nuxt/schema'
import { useHead as _useHead, useTagMetaFlat as _useTagMetaFlat } from '@vueuse/head'

/**
 * You can pass in a meta object, which has keys corresponding to meta tags:
 * `title`, `base`, `script`, `style`, `meta` and `link`, as well as `htmlAttrs` and `bodyAttrs`.
 *
 * Alternatively, for reactive meta state, you can pass in a function
 * that returns a meta object.
 */
export function useHead<T extends HeadAugmentations> (input: UseHeadInput<T>, options?: HeadEntryOptions) {
  return _useHead(input, options)
}

export function useServerHead<T extends HeadAugmentations> (input: UseHeadInput<T>) {
  if (process.server) {
    return _useHead(input, { mode: 'server' })
  }
}

export { injectHead } from '@vueuse/head'

export const useTagMetaFlat = _useTagMetaFlat
