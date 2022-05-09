import type { RouterConfig } from '@nuxt/schema'
import { nextTick } from 'vue'
import { useNuxtApp } from '#app'

// https://router.vuejs.org/api/#routeroptions
export default <RouterConfig>{
  scrollBehavior (to, from, savedPosition) {
    const nuxtApp = useNuxtApp()
    // If the returned position is falsy or an empty object, will retain current scroll position
    let position
    const isRouteChanged = to !== from

    // savedPosition is only available for popstate navigations (back button)
    if (savedPosition) {
      position = savedPosition
    } else if (isRouteChanged) {
      position = { left: 0, top: 0 }
    }

    // if either to or from has no transition then wait for page:finish
    const hasTransition = to.meta.pageTransition !== false && from.meta.pageTransition !== false
    const hookAwait = hasTransition ? 'page:transition:finish' : 'page:finish'

    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookAwait, async () => {
        await nextTick()

        if (to.hash) {
          let top = 0

          // vue-router does not incorporate scroll-margin-top on its own.
          const elem = document.querySelector(to.hash)

          if (elem) {
            top = parseFloat(getComputedStyle(elem).scrollMarginTop)
          }

          position = {
            el: to.hash,
            top
          }
        }
        resolve(position)
      })
    })
  }
}
