import { useRoute } from '#app'

export function useLayout (layout: string) {
  const route = useRoute()
  route.meta.layout = layout
}
