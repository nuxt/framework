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

    // if either to or from has no transition
    // and to is not async setup, then we can scroll right away
    const hasTransition = to.meta.pageTransition !== false && from.meta.pageTransition !== false
    if (!hasTransition) {
      const proto = Object.getPrototypeOf(to.matched[0].components.default.setup || '')

      if (proto.constructor.name !== 'AsyncFunction') {
        return position
      }
    }

    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:transition:finish', async () => {
        await nextTick()

        // coords will be used if no selector is provided,
        // or if the selector didn't match any element.
        if (to.hash) {
          let hash = to.hash
          // CSS.escape() is not supported with IE and Edge.
          if (
            typeof window.CSS !== 'undefined' &&
            typeof window.CSS.escape !== 'undefined'
          ) {
            hash = '#' + window.CSS.escape(hash.substr(1))
          }
          try {
            const elem = document.querySelector(hash)

            // vue-router does not incorporate scroll-margin-top on its own.
            if (elem) {
              const offset = parseFloat(getComputedStyle(elem).scrollMarginTop)
              position = {
                selector: hash,
                offset: { y: offset }
              }
            } else {
              position = { selector: hash }
            }
          } catch (e) {
            console.warn(
              'Failed to save scroll position. Please add CSS.escape() polyfill (https://github.com/mathiasbynens/CSS.escape).'
            )
          }
        }
        resolve(position)
      })
    })
  }
}
