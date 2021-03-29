import { ComponentInternalInstance, DefineComponent, defineComponent, getCurrentInstance } from 'vue'

export const defineNuxtComponent: typeof defineComponent = function defineNuxtComponent (options: any): any {
  const { setup } = options
  if (!setup) {
    return options
  }
  return {
    ...options,
    setup (props, ctx) {
      const vm = getCurrentInstance() as ComponentInternalInstance & { _pendingPromises: Array<Promise<void>> }

      vm._pendingPromises = []

      const p = setup(props, ctx)

      if (p instanceof Promise) {
        return p.then(async (result) => {
          await Promise.all(vm._pendingPromises)
          return result
        })
      }

      if (vm._pendingPromises.length) {
        return Promise.all(vm._pendingPromises).then(() => p)
      }

      return p
    }
  } as DefineComponent
}
