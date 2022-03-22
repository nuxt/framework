import { getContentDocument, defineNuxtRouteMiddleware } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  // TODO: Fix this upstream
  if (!to.path || to.fullPath.startsWith('/api') || to.fullPath.endsWith('.ico')) { return }

  const currentPage = useState<any>('current-page')

  if (!currentPage.value || Array.isArray(currentPage.value)) {
    console.warn(`Could not find document for ${to.path}`)
    return
  }

  const document = useState<any>('document')

  try {
    await getContentDocument(currentPage.value.id).then(doc => (document.value = doc))
  } catch (e) {
    console.log(e)
  }
})
