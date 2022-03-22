export default defineNuxtPlugin(() => {
  const route = useRoute()

  const { hook } = useNuxtApp()

  const current = useState<any>('current-page')

  const next = useState<any>('next-page')

  const previous = useState<any>('previous-page')

  const document = useState<any>('document')

  const toc = computed(() => document.value?.body?.toc || [])

  const type = computed(() => document.value?.meta?.type)

  const fetchPage = async () => {
    const query = useContentQuery()

    await Promise.all([
      query.where({ slug: route.path }).findOne(),
      query
        .where({ $not: { slug: '/' } })
        .where({ $not: { empty: true } })
        .findSurround(route.path)
    ]).then(([page, surround]) => {
      if (!page || (page.length && page.length === 0)) {
        // eslint-disable-next-line no-console
        console.log(`No document found for ${route.path}`)

        current.value = { id: 'not-found' }

        return
      }

      previous.value = surround[0]

      next.value = surround[1]

      current.value = page
    })
  }

  const fetchDocument = async ({ key }: { key: string }) => {
    if (key !== current.value.id || !key) { return }

    const query = await getContentDocument(current.value.id)

    document.value = query
  }

  const fetch = async ({ key }: { key: string }) => {
    await fetchPage()
    await fetchDocument({ key })
  }

  const provide = {
    page: {
      document,
      current,
      toc,
      type
    }
  }

  if (process.client) {
    // @ts-ignore
    hook('content:update', fetch)

    // @ts-ignore
    if (process.dev) { window.$page = provide }
  }

  return {
    provide
  }
})
