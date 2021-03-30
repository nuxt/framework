import { ComponentInternalInstance, DefineComponent, defineComponent, getCurrentInstance } from 'vue'

export interface NuxtComponentInternalInstance extends ComponentInternalInstance {
  _pendingPromises?: Array<Promise<void>>
}

export function getCurrentNuxtComponentInstance (): NuxtComponentInternalInstance {
  return getCurrentInstance() as NuxtComponentInternalInstance
}

export function useAsyncSetup () {
  const vm = getCurrentNuxtComponentInstance()
  vm._pendingPromises = vm._pendingPromises || []

  function clearPromises () {
    vm._pendingPromises.length = 0
  }

  function waitFor (promise: Promise<any>): void {
    vm._pendingPromises.push(promise)
  }

  function waitOnPromises () {
    return Promise.all(vm._pendingPromises).finally(clearPromises)
  }

  return {
    promises: vm._pendingPromises,
    waitFor,
    waitOnPromises
  }
}

export const defineNuxtComponent: typeof defineComponent = function defineNuxtComponent (options: any): any {
  const { setup } = options
  if (!setup) {
    return options
  }
  return {
    ...options,
    setup (props, ctx) {
      const { waitOnPromises, promises } = useAsyncSetup()

      const p = setup(props, ctx)

      if (p instanceof Function) {
        return p
      }

      if (p instanceof Promise) {
        return p.then(async (result) => {
          await waitOnPromises()
          return result
        })
      }

      if (promises.length) {
        return waitOnPromises()
          .then(() => p)
      }

      return p
    }
  } as DefineComponent
}
