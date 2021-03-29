import { ComponentInternalInstance, DefineComponent, defineComponent, getCurrentInstance } from 'vue'

export interface NuxtComponentInternalInstance extends ComponentInternalInstance {
  _pendingPromises: Array<Promise<void>>
}

export function getCurrentNuxtComponentInstance (): NuxtComponentInternalInstance {
  const vm = getCurrentInstance() as NuxtComponentInternalInstance
  vm._pendingPromises = vm._pendingPromises || []
  return vm
}

export const defineNuxtComponent: typeof defineComponent = function defineNuxtComponent (options: any): any {
  const { setup } = options
  if (!setup) {
    return options
  }
  return {
    ...options,
    setup (props, ctx) {
      const vm = getCurrentNuxtComponentInstance()

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
