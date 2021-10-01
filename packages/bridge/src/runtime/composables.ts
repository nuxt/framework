import { getCurrentInstance, reactive, watch } from '@vue/composition-api'
import { useNuxtApp } from './app'
export * from '@vue/composition-api'

const mock = () => () => { throw new Error('not implemented') }

export const useAsyncData = mock()
export const asyncData = mock()
export const useSSRRef = mock()
export const useData = mock()
export const useGlobalData = mock()
export const useHydration = mock()

// Auto-import equivalents for `vue-router`
export const useRouter = () => {
  return useNuxtApp()?.legacyNuxt.router
}

// This provides an equivalent interface to `vue-router` (unlike legacy implementation)
export const useRoute = () => {
  const nuxt = useNuxtApp()
  if (!nuxt) { throw new Error('useRoute must be called from within a Vue component') }

  if (!nuxt._route) {
    nuxt._route = reactive(nuxt.legacyNuxt.context.route)
    const router = useRouter()
    router.afterEach(route => Object.assign(nuxt._route, route))
  }

  return nuxt._route as {
    path: string
    name?: string | null
    hash: string
    query: Record<string, string | (string | null)[]>
    params: Record<string, string>
    fullPath: string
    matched: any[]
    redirectedFrom?: string
    meta?: any
  }
}
