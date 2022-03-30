import type { RouterOptions } from '@nuxt/schema'
import { nextTick } from 'vue'
import { useNuxtApp } from '#app'

function setScrollRestoration (newVal) {
  try {
    window.history.scrollRestoration = newVal
  } catch (e) { }
}

if (process.client) {
  if ('scrollRestoration' in window.history) {
    setScrollRestoration('manual')

    // reset scrollRestoration to auto when leaving page, allowing page reload
    // and back-navigation from other pages to use the browser to restore the
    // scrolling position.
    window.addEventListener('beforeunload', () => {
      setScrollRestoration('auto')
    })

    // Setting scrollRestoration to manual again when returning to this page.
    window.addEventListener('load', () => {
      setScrollRestoration('manual')
    })
  }
}

// https://router.vuejs.org/api/#routeroptions
export default <RouterOptions>{
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
