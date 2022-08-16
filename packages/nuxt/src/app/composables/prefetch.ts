import { useNuxtApp } from '#app'

/**
 * Prefetch a component or components that have been globally registered
 * with the Nuxt component integration.
 *
 * @note This does not work for components you have globally registered yourself.
 * @param components Pascal-cased name or names of components to prefetch
 */
export const prefetchComponents = (components: string | string[]) => {
  if (process.server) { return }

  return useNuxtApp().callHook('components:prefetch', components)
}
