import type { MetaObject } from '@nuxt/schema'
import { MaybeComputedRef } from '@vueuse/shared'
import type { UseHeadRawInput } from '@vueuse/head'
import { useNuxtApp } from '#app'

/**
 * You can pass in a meta object, which has keys corresponding to meta tags:
 * `title`, `base`, `script`, `style`, `meta` and `link`, as well as `htmlAttrs` and `bodyAttrs`.
 *
 * Alternatively, for reactive meta state, you can pass in a function
 * that returns a meta object.
 */
export function useHead (meta: MaybeComputedRef<MetaObject>) {
  useNuxtApp()._useHead(meta)
}

/**
 * Same as `useHead` but will render meta tags without encoding.
 *
 * Warning: This function opens you up to XSS attacks. Only use this if you trust the source of the meta tag data.
 */
export function useHeadRaw (meta: UseHeadRawInput) {
  useNuxtApp()._useHead(meta, { raw: true })
}

// TODO: remove useMeta support when Nuxt 3 is stable
/** @deprecated Please use new `useHead` composable instead */
export function useMeta (meta: MaybeComputedRef<MetaObject>) {
  return useHead(meta)
}
