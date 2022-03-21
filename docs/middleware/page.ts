import { useContentQuery, defineNuxtRouteMiddleware } from '#imports'

export default defineNuxtRouteMiddleware(async to => {
  if (!to.path || to.fullPath.startsWith('/api') || to.fullPath.endsWith('.ico')) return

  const currentPage = useState<any>('current-page')

  const nextPage = useState<any>('next-page')

  const previousPage = useState<any>('previous-page')

  const query = useContentQuery()

  try {
    await Promise.all([
      query.where({ slug: to.path }).findOne(),
      query
        .where({ $not: { slug: '/' } })
        .where({ $not: { empty: true } })
        .findSurround(to.path)
    ]).then(([page, surround]) => {
      if (!page || (page.length && page.length === 0)) {
        // eslint-disable-next-line no-console
        console.log(`No document found for ${to.path}`)

        currentPage.value = { id: 'not-found' }

        return
      }

      console.log(page)

      previousPage.value = surround[0]

      nextPage.value = surround[1]

      currentPage.value = page

      // @ts-ignore - Set layout on next route from content
      if (currentPage.value.layout) to.meta.layout = currentPage.value.layout
      if (!currentPage.value.layout) to.meta.layout = 'default'
    })
  } catch (e) {
    console.log(e)
  }
})
