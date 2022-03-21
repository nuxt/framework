import { withBase } from 'ufo'
import type { NavItem } from '@nuxt/content/dist/runtime/types'
import { findElement, isDocument } from '../utils/navigation'
import { defineNuxtRouteMiddleware } from '#imports'

export default defineNuxtRouteMiddleware(async to => {
  // TODO: Fix this upstream
  if (!to.path || to.fullPath.startsWith('/api') || to.fullPath.endsWith('.ico')) return

  const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().content.basePath)

  const currentPage = useState<any>('current-page')

  const navigation = useState<any>('navigation')

  const breadcrumb = useState<any>('navigation-breadcrumb')

  const previous = useState<any>('navigation-previous')

  const currentDirectory = useState('navigation-current-directory')

  let redirect: NavItem

  try {
    redirect = await $fetch<NavItem[]>(withContentBase('/navigation')).then(nav => {
      // console.log('==================================================================')
      let redirection: NavItem

      navigation.value = nav

      if (nav && nav.length) {
        // Find current page
        const id = currentPage.value && currentPage.value.id ? currentPage.value.id : to.path

        const { tree, found } = findElement(
          nav,
          id,
          [],
          node => isDocument(node) && (node.id === id || node.slug === id)
        )

        // Breadcrumb
        if (tree) breadcrumb.value = tree
        else breadcrumb.value = []

        // Previous node
        if (breadcrumb.value && breadcrumb.value.length) {
          previous.value = breadcrumb.value[breadcrumb.value.length - 1]
        } else {
          previous.value = undefined
        }

        // console.log({ tree, found })
      }

      // console.log('==================================================================')

      if (redirection) return redirection
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }

  if (redirect) return redirect.slug
})
