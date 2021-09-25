import { toRefs } from '@vue/reactivity'
import { defineComponent, getCurrentInstance } from 'vue'
import type { ComponentInternalInstance, DefineComponent } from 'vue'
import { useRoute } from 'vue-router'
import type { LegacyContext } from '../legacy'
import { useNuxtApp } from '../nuxt'
import { asyncData } from './asyncData'

export const NuxtComponentIndicator = '__nuxt_component'
export const NuxtComponentPendingPromises = '_pendingPromises'

export interface NuxtComponentInternalInstance extends ComponentInternalInstance {
  [NuxtComponentPendingPromises]: Array<Promise<void>>
}

export function getCurrentNuxtComponentInstance (functionName?: string): NuxtComponentInternalInstance {
  const vm = getCurrentInstance() as NuxtComponentInternalInstance

  if (!vm || !vm.proxy.$options[NuxtComponentIndicator]) {
    throw new Error(`${functionName ? `\`${functionName}()\`` : 'This method'} can only be used within a component defined with \`defineNuxtComponent()\` or \`<script setup nuxt>\`.`)
  }

  return vm
}

async function runLegacyAsyncData (res: Record<string, any> | Promise<Record<string, any>>, fn: (context: LegacyContext) => Promise<Record<string, any>>) {
  const nuxt = useNuxtApp()
  const route = useRoute()
  const vm = getCurrentNuxtComponentInstance()
  const { fetchKey } = vm.proxy.$options
  const key = typeof fetchKey === 'function' ? fetchKey(() => '') : fetchKey || route.fullPath
  const { data } = await asyncData(`options:asyncdata:${key}`, () => fn(nuxt._legacyContext))
  Object.assign(await res, toRefs(data))
}

export const defineNuxtComponent: typeof defineComponent =
  function defineNuxtComponent (options: any): any {
    const { setup } = options

    if (!setup && !options.asyncData) {
      return {
        [NuxtComponentIndicator]: true,
        ...options
      }
    }

    return {
      [NuxtComponentIndicator]: true,
      ...options,
      setup (props, ctx) {
        const vm = getCurrentInstance()

        let res = setup?.(props, ctx)
        let promises: unknown[] | undefined = vm[NuxtComponentPendingPromises]

        // skip if no asyncData is used in this component
        if (!promises?.length && !(res instanceof Promise) && !options.asyncData) {
          return res
        }

        promises = promises || []
        res = res || {}

        if (options.asyncData) {
          promises.push(runLegacyAsyncData(res, options.asyncData))
        }

        return Promise.resolve(res)
          .then(() => Promise.all(promises))
          .then(() => res)
          .finally(() => {
            promises.length = 0
            promises = null
            delete vm[NuxtComponentPendingPromises]
          })
      }
    } as DefineComponent
  }
