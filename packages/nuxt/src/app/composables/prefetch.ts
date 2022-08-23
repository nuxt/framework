import type { Component } from 'vue'
import { useNuxtApp } from '#app'

function prefetchAsyncComponent (component: Component) {
  if ((component as any)?.__asyncLoader && !(component as any).__asyncResolved) {
    return (component as any).__asyncLoader()
  }
}

/**
 * Prefetch a component or components that have been globally registered
 * with the Nuxt component integration.
 *
 * @note This does not work for components you have globally registered yourself.
 * @param components Pascal-cased name or names of components to prefetch
 */
export const prefetchComponents = async (components: string | string[]) => {
  if (process.server) { return }
  const nuxtApp = useNuxtApp()

  components = Array.isArray(components) ? components : [components]
  await Promise.all(components.map(name => prefetchAsyncComponent(nuxtApp.vueApp._context.components[name])))
}
