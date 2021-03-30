import { Ref, ref, onBeforeMount, watch, onUnmounted } from 'vue'
import { Nuxt, useNuxt } from '@nuxt/app'

import { useAsyncSetup } from './component'
import { ensureReactive, useGlobalData } from './data'

export type AsyncDataFn<T> = (ctx?: Nuxt) => Promise<T>

export interface AsyncDataOptions {
  server?: boolean
  defer?: boolean
}

export interface AsyncDataObj<T> {
  data: Ref<T>
  pending: Ref<boolean>
  refresh: () => Promise<void>
  error?: any
}

export interface AsyncDataFetchOptions {
  deduplicate: boolean
}

export function useAsyncData (defaults?: AsyncDataOptions) {
  const nuxt = useNuxt()
  const { waitFor } = useAsyncSetup()
  const onBeforeMountCbs: Array<() => void> = []

  if (process.client) {
    onBeforeMount(() => {
      onBeforeMountCbs.forEach((cb) => { cb() })
      onBeforeMountCbs.splice(0, onBeforeMountCbs.length)
    })

    onUnmounted(() => onBeforeMountCbs.splice(0, onBeforeMountCbs.length))
  }

  return function asyncData<T = Record<string, any>> (
    key: string,
    handler: AsyncDataFn<T>,
    options?: AsyncDataOptions
  ): AsyncDataObj<T> {
    if (typeof handler !== 'function') {
      throw new TypeError('asyncData handler must be a function')
    }
    options = {
      server: true,
      defer: false,
      ...defaults,
      ...options
    }

    const data = useGlobalData(nuxt)
    const pending = ref(true)

    const datastore = ensureReactive(data, key)

    const fetch = async (opts: Partial<AsyncDataFetchOptions> = {}) => {
      if (opts.deduplicate !== false && pending.value) {
        return
      }
      pending.value = true
      const _handler = handler(nuxt)

      if (_handler instanceof Promise) {
        // Let user resolve if request is promise
        // TODO: handle error
        const result = await _handler

        for (const _key in result) {
          datastore[_key] = result[_key]
        }

        pending.value = false
      } else {
        // Invalid request
        throw new TypeError('Invalid asyncData handler: ' + _handler)
      }
    }

    const clientOnly = options.server === false

    // Client side
    if (process.client) {
      // 1. Hydration (server: true): no fetch
      if (nuxt.isHydrating && options.server) {
        pending.value = false
      }
      // 2. Initial load (server: false): fetch on mounted
      if (nuxt.isHydrating && !options.server) {
        // Fetch on mounted (initial load or deferred fetch)
        onBeforeMountCbs.push(fetch)
      } else if (!nuxt.isHydrating) {
        if (options.defer) {
          // 3. Navigation (defer: true): fetch on mounted
          onBeforeMountCbs.push(fetch)
        } else {
          // 4. Navigation (defer: false): await fetch
          waitFor(fetch())
        }
      }
      // Watch handler
      watch(handler.bind(null, nuxt), fetch)
    }

    // Server side
    if (process.server && !clientOnly) {
      waitFor(fetch())
    }

    return {
      data: datastore,
      pending,
      refresh: fetch
    }
  }
}

export function asyncData<T = Record<string, any>> (
  key: string,
  handler: AsyncDataFn<T>,
  options?: AsyncDataOptions
): AsyncDataObj<T> {
  return useAsyncData()(key, handler, options)
}
