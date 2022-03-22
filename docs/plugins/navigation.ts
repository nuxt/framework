import type { NavItem } from '@nuxt/content/dist/runtime/types'
import { withBase } from 'ufo'
import { findElement, isDocument, findIndex } from '../utils/navigation'

export default defineNuxtPlugin(() => {
  const { hook } = useNuxtApp()

  const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().content.basePath)

  const navigation = useState<NavItem[]>('navigation', () => [])

  const next = useState<any>('next-page')

  const previous = useState<any>('previous-page')

  const breadcrumb = useState<any[]>('navigation-breadcrumb')

  const index = computed(() => findIndex(navigation.value))

  const find = (id: string) => findElement(navigation.value, id)

  const fetch = async () => {
    const query = await $fetch<any[]>(withContentBase('/navigation'))

    navigation.value = query
  }

  const provide = {
    navigation: {
      index,
      breadcrumb,
      navigation,
      next,
      previous,
      find,
      isDocument
    }
  }

  if (process.client) {
    // @ts-ignore
    hook('content:update', fetch)

    // @ts-ignore
    if (process.dev) { window.$navigation = provide }
  }

  return {
    provide
  }
})
