export const useContentBody = () => {
  const { $document } = useNuxtApp()

  return $document
}
