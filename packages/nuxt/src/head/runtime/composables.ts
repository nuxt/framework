import type { UseHeadInput } from '@vueuse/head'
import type { HeadAugmentations } from '@nuxt/schema'
import { useNuxtApp } from '#app'

/**
 * You can pass in a meta object, which has keys corresponding to meta tags:
 * `title`, `base`, `script`, `style`, `meta` and `link`, as well as `htmlAttrs` and `bodyAttrs`.
 *
 * Alternatively, for reactive meta state, you can pass in a function
 * that returns a meta object.
 */
export function useHead<T extends HeadAugmentations> (meta: UseHeadInput<T>) {
  useNuxtApp()._useHead(meta)
}

// TODO: remove useMeta support when Nuxt 3 is stable
/** @deprecated Please use new `useHead` composable instead */
export function useMeta<T extends HeadAugmentations> (meta: UseHeadInput<T>) {
  return useHead(meta)
}
