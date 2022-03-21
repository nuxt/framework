export default defineNuxtPlugin(() => {
  const { hook } = useNuxtApp()

  const currentPage = useState<any>('current-page')


  const fetch = async ({ key }: { key: string }) => {
    if (key !== currentPage.value.id || !key) { return }

    const query = await getContentDocument(currentPage.value.id)

    document.value = query
  }

  const provide = {
    document: {
      document,
      type,
      toc
    }
  }

  if (process.client) {
    // @ts-ignore
    hook('content:update', fetch)

    // @ts-ignore
    if (process.dev) { window.$document = provide }
  }

  return {
    provide
  }
})
