import type { HeadEntryOptions, UseHeadInput, ActiveHeadEntry } from '@vueuse/head'
import type { HeadAugmentations } from '@nuxt/schema'
import { useNuxtApp } from '#app'

/**
 * You can pass in a meta object, which has keys corresponding to meta tags:
 * `title`, `base`, `script`, `style`, `meta` and `link`, as well as `htmlAttrs` and `bodyAttrs`.
 *
 * Alternatively, for reactive meta state, you can pass in a function
 * that returns a meta object.
 */
export function useHead<T extends HeadAugmentations> (input: UseHeadInput<T>, options?: HeadEntryOptions): ActiveHeadEntry<UseHeadInput<T>> | void {
  return useNuxtApp()._useHead(input, options)
}

export function useServerHead<T extends HeadAugmentations> (input: UseHeadInput<T>) {
  if (process.server) {
    return useHead(input, { mode: 'server' })
  }
}

// TODO: remove useMeta support when Nuxt 3 is stable
/** @deprecated Please use new `useHead` composable instead */
export function useMeta<T extends HeadAugmentations> (input: UseHeadInput<T>) {
  return useHead(input)
}
