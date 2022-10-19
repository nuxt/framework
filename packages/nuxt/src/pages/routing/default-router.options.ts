import type { RouterConfig } from '@nuxt/schema'
import type { RouterScrollBehavior } from 'vue-router'
import { nextTick } from 'vue'
import { useNuxtApp } from '#app'

type ScrollPosition = Exclude<Awaited<ReturnType<RouterScrollBehavior>>, false|void>

// https://router.vuejs.org/api/#routeroptions
export default <RouterConfig>{
  scrollBehavior (to, from, savedPosition) {
    const nuxtApp = useNuxtApp()

    // By default when the returned position is falsy or an empty object, vue-router will retain the current scroll position
    let position: ScrollPosition

    // SavedPosition is only available for popstate navigations (back button)
    if (savedPosition) {
      position = savedPosition
    } else if (to !== from /* Route changed */) {
      position = { left: 0, top: 0 }
    }

    // Hash routes on the same page, no page hook is fired so resolve here
    if (to.path !== from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 }
      }
      if (to.hash) {
        return {
          el: to.hash,
          top: _getHashElementScrollMarginTop(to.hash)
        }
      }
    }

    // Wait for page:transition:finish or page:finish depending on transitions enabled or not
    const hasTransition = to.meta.pageTransition !== false && from.meta.pageTransition !== false
    const hookToWait = hasTransition ? 'page:transition:finish' : 'page:finish'
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookToWait, async () => {
        await nextTick()
        if (to.hash) {
          position = {
            el: to.hash,
            top: _getHashElementScrollMarginTop(to.hash)
          }
        }
        resolve(position)
      })
    })
  }
}

function _getHashElementScrollMarginTop (selector: string): number {
  const elem = document.querySelector(selector)
  if (elem) {
    return parseFloat(getComputedStyle(elem).scrollMarginTop)
  }
  return 0
}
