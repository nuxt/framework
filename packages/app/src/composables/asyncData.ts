import { Ref, ref, onBeforeMount, onUnmounted, UnwrapRef, watch, getCurrentInstance } from 'vue'
import { Nuxt, useNuxt } from '@nuxt/app'

import { NuxtComponentPendingPromises } from './component'
import { ensureReactive, useGlobalData } from './data'

export type AsyncDataFn<T> = (ctx?: Nuxt) => Promise<T>

export interface AsyncDataOptions {
  server?: boolean
  defer?: boolean
}

export interface AsyncDataResult<T> extends Promise<UnwrapRef<T>> {
  data: UnwrapRef<T>
  pending: Ref<boolean>
  refresh: () => Promise<UnwrapRef<T>>
  error?: any
}

export interface AsyncDataFetchOptions {
  deduplicate: boolean
}

export function useAsyncData (defaults?: AsyncDataOptions) {
  const nuxt = useNuxt()
  const vm = getCurrentInstance()
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
    options: AsyncDataOptions = {}
  ): AsyncDataResult<T> {
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

    const datastore = ensureReactive(data, key) as UnwrapRef<T>

    const fetch = async (): Promise<any> => {
      pending.value = true
      const _handler = handler(nuxt)

      if (_handler instanceof Promise) {
        // Let user resolve if request is promise
        // TODO: handle error
        const result = await _handler

        for (const _key in result) {
          datastore[_key as string] = result[_key]
        }

        pending.value = false
        return datastore
      } else {
        // Invalid request
        throw new TypeError('Invalid asyncData handler: ' + _handler)
      }
    }

    let initialFetch: Partial<AsyncDataResult<T>> = Promise.resolve(datastore)

    const fetchOnServer = options.server !== false
    const clientOnly = options.server === false

    // Server side
    if (process.server && fetchOnServer) {
      initialFetch = fetch()
    }

    // Client side
    if (process.client) {
      // Watch handler
      watch(handler.bind(null, nuxt), fetch)

      // 1. Hydration (server: true): no fetch
      if (nuxt.isHydrating && fetchOnServer) {
        pending.value = false
      }
      // 2. Initial load (server: false): fetch on mounted
      if (nuxt.isHydrating && clientOnly) {
        // Fetch on mounted (initial load or deferred fetch)
        onBeforeMountCbs.push(fetch)
      } else if (!nuxt.isHydrating) { // Navigation
        if (options.defer) {
          // 3. Navigation (defer: true): fetch on mounted
          onBeforeMountCbs.push(fetch)
        } else {
          // 4. Navigation (defer: false): await fetch
          initialFetch = fetch()
        }
      }
    }

    // Append utils
    initialFetch.data = datastore
    initialFetch.pending = pending
    initialFetch.refresh = fetch

    // Auto enqueue if within nuxt component instance
    if (vm[NuxtComponentPendingPromises]) {
      vm[NuxtComponentPendingPromises].push(initialFetch)
    }

    return initialFetch as AsyncDataResult<T>
  }
}

export function asyncData<T = Record<string, any>> (
  key: string, handler: AsyncDataFn<T>, options?: AsyncDataOptions
): AsyncDataResult<T> {
  return useAsyncData()(key, handler, options)
}
