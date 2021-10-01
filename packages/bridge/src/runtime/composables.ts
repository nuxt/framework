import { getCurrentInstance } from '@vue/composition-api'
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
  return getCurrentInstance()?.proxy.$router
}

// This provides an equivalent interface to `vue-router` (unlike legacy implementation)
export const useRoute = () => {
  const vm = getCurrentInstance()?.root.proxy
  if (!vm) { throw new Error('useRoute must be called from within a Vue component') }
  if (!vm._route) {
    vm._route = reactive(vm.$route)
    watch(() => vm.$route, route => Object.assign(vm._route, route))
  }
  return vm._route
}
