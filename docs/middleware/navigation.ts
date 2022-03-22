import { withBase } from 'ufo'
import type { NavItem } from '@nuxt/content/dist/runtime/types'
import { findElement, isDocument } from '../utils/navigation'
import { defineNuxtRouteMiddleware } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  // TODO: Fix this upstream
  if (!to.path || to.fullPath.startsWith('/api') || to.fullPath.endsWith('.ico')) { return }

  const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().content.basePath)

  const currentPage = useState<any>('current-page')

  const navigation = useState<any>('navigation')

  const breadcrumb = useState<any>('navigation-breadcrumb')

  // Get first level of navigation
  const level = to.path.split('/')[1]

  let redirect: NavItem

  try {
    redirect = await $fetch<NavItem[]>(withContentBase('/navigation'), {
      method: 'POST',
      body: {
        where: {
          slug: {
            $contains: '/' + level
          }
        }
      }
    }).then((nav) => {
      let redirection: NavItem

      navigation.value = nav

      if (nav && nav.length) {
        // Find current page
        const id = currentPage.value && currentPage.value.id ? currentPage.value.id : to.path

        const { tree } = findElement(
          nav,
          id,
          [],
          node => isDocument(node) && (node.id === id || node.slug === id)
        )

        // Breadcrumb
        if (tree) { breadcrumb.value = tree } else { breadcrumb.value = [] }
      }

      if (redirection) { return redirection }
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
})
