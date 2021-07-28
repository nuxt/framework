// import { useMeta as useVueMeta } from 'vue-meta'
import { isFunction } from '@vue/shared'
import { computed, ComputedGetter } from '@vue/reactivity'
import { useNuxt } from '@nuxt/app'
import type { MetaObject } from '@nuxt/meta'

/**
 * You can pass in a meta object, which has keys corresponding to meta tags:
 * `title`, `base`, `script`, `style`, `meta` and `link`, as well as `htmlAttrs` and `bodyAttrs`.
 *
 * Alternatively, for reactive meta state, you can pass in a function
 * that returns a meta object.
 */
export function useMeta (meta: MetaObject | ComputedGetter<MetaObject>) {
  const resolvedMeta = isFunction(meta) ? computed(meta) : meta
  useNuxt()._useMeta(resolvedMeta)
}
