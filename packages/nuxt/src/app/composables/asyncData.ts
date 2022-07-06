import { onBeforeMount, onServerPrefetch, onUnmounted, ref, getCurrentInstance, watch, unref } from 'vue'
import type { Ref, WatchSource } from 'vue'
import { wrapInRef } from './utils'
import { NuxtApp, useNuxtApp } from '#app'

export type _Transform<Input = any, Output = any> = (input: Input) => Output

export type PickFrom<T, K extends Array<string>> = T extends Array<any>
  ? T
  : T extends Record<string, any>
  ? keyof T extends K[number]
    ? T // Exact same keys as the target, skip Pick
    : Pick<T, K[number]>
  : T

export type KeysOf<T> = Array<keyof T extends string ? keyof T : string>
export type KeyOfRes<Transform extends _Transform> = KeysOf<ReturnType<Transform>>

type MultiWatchSources = (WatchSource<unknown> | object)[];

export interface AsyncDataOptions<
  DataT,
  Transform extends _Transform<DataT, any> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<_Transform> = KeyOfRes<Transform>
  > {
  server?: boolean
  lazy?: boolean
  default?: () => DataT | Ref<DataT>
  transform?: Transform
  pick?: PickKeys
  watch?: MultiWatchSources
  initialCache?: boolean
}

export interface RefreshOptions {
  _initial?: boolean,
  force?: boolean
}

export interface _AsyncData<DataT, ErrorT> {
  data: Ref<DataT>
  pending: Ref<boolean>
  refresh: (opts?: RefreshOptions) => Promise<void>
  error: Ref<ErrorT>
}

export type AsyncData<Data, Error> = _AsyncData<Data, Error> & Promise<_AsyncData<Data, Error>>

export function useAsyncData<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
> (
  key: string,
  handler: (ctx?: NuxtApp) => Promise<DataT>,
  options: AsyncDataOptions<DataT, Transform, PickKeys> = {}
): AsyncData<PickFrom<ReturnType<Transform>, PickKeys>, DataE | null | true> {
  // Validate arguments
  if (typeof key !== 'string') {
    throw new TypeError('asyncData key must be a string')
  }

  if (typeof handler !== 'function') {
    throw new TypeError('asyncData handler must be a function')
  }

  // Apply defaults
  options = { server: true, default: () => null, ...options }
  // TODO: remove support for `defer` in Nuxt 3 RC
  if ((options as any).defer) {
    console.warn('[useAsyncData] `defer` has been renamed to `lazy`. Support for `defer` will be removed in RC.')
  }
  options.lazy = options.lazy ?? (options as any).defer ?? false
  options.initialCache = options.initialCache ?? true

  // Setup nuxt instance payload
  const nuxt = useNuxtApp()

  // Grab the payload for this key
  let payload: AsyncData<DataT, DataE> = nuxt._asyncDataPayloads[key]

  // If there's no payload
  if (!payload) {
    payload = {
      data: wrapInRef(unref(options.default())),
      pending: ref(true),
      error: ref(null)
    } as AsyncData<DataT, DataE>

    nuxt._asyncDataPayloads[key] = payload

    nuxt.hook('app:rendered', () => {
      delete nuxt._asyncDataPayloads[key]
    })
  }

  const tagAlongOrRun = <T>(
    run: (ctx?: NuxtApp) => Promise<T>
  ): [boolean, Promise<T>] => {
    // Nobody else has run the promise yet! Let everyone know
    if (nuxt._asyncDataPromises[key] === undefined) {
      // Remove the promise when its finished
      nuxt._asyncDataPromises[key] = run(nuxt)
      return [false, nuxt._asyncDataPromises[key]]
    } else {
      return [true, nuxt._asyncDataPromises[key]]
    }
  }

  payload.refresh = async (refreshOptions: RefreshOptions) => {
    refreshOptions = refreshOptions ?? { _initial: false, force: false }

    // Check if a refresh is already in progress, if it is just tag along
    // Otherwise grab a new promise from the handler
    let promise: Promise<any> = null
    let isTagAlong = false

    if (refreshOptions.force) {
      promise = handler(nuxt)
    } else {
      [isTagAlong, promise] = tagAlongOrRun(handler)
    }

    promise = promise.then(x => [true, x])

    // Catch any errors and return
    const [success, result]: [boolean, DataT | DataE] = await promise.catch(x => [false, x as DataE])

    // If we just tagged along, we don't need to do any processing, the original request will do it
    if (isTagAlong) { return }

    // If the promise is rejected give the user the error
    // Also tell nuxt something went wrong
    if (!success) {
      payload.error.value = result as DataE
      nuxt.payload._errors[key] = true
    } else {
      // If our promise resolved update our payload!
      let data = result as DataT

      if (options.transform) { data = options.transform(data) }

      if (options.pick) { data = pick(data, options.pick) as DataT }

      payload.data.value = data
      payload.error.value = null
    }

    // Cache our data if its the inital fetch, or we're running on the server
    // We don't need to cache client `refresh` calls, but we should cache server `refresh` calls
    if (refreshOptions._initial || process.server) {
      nuxt.payload.data[key] = payload.data.value
    }

    // No matter what the promise has now resolved.
    payload.pending.value = false

    // Remove the promise so we don't try tag along
    delete nuxt._asyncDataPromises[key]
  }

  // Should/Have we fetched on the server?
  const fetchOnServer = options.server !== false && nuxt.payload.serverRendered

  let promise = Promise.resolve()

  // If we are using the cache
  if (options.initialCache && nuxt.payload.data[key]) {
    payload.data.value = nuxt.payload.data[key]
    payload.pending.value = false
  } else if (process.server && fetchOnServer) {
    // Make our promise resolve when the refresh is complete
    promise = payload.refresh({ _initial: true })

    onServerPrefetch(() => promise)
  } else if (process.client) {
    const instance = getCurrentInstance()
    if (instance && !instance._nuxtOnBeforeMountCbs) {
      const cbs = (instance._nuxtOnBeforeMountCbs = [])

      onBeforeMount(() => {
        cbs.forEach((cb) => {
          cb()
        })
        cbs.splice(0, cbs.length)
      })

      onUnmounted(() => cbs.splice(0, cbs.length))
    }

    if (fetchOnServer && nuxt.isHydrating && key in nuxt.payload.data) {
      // 1. Hydration (server: true): no fetch
      payload.pending.value = false
    } else if (instance && nuxt.payload.serverRendered && (nuxt.isHydrating || options.lazy)) {
      // 2. Initial load (server: false): fetch on mounted
      // 3. Navigation (lazy: true): fetch on mounted
      instance._nuxtOnBeforeMountCbs.push(() => payload.refresh({ _initial: true }))
    } else {
      // 4. Navigation (lazy: false) - or plugin usage: await fetch
      promise = payload.refresh({ _initial: true })
    }

    if (options.watch) {
      watch(options.watch, () => payload.refresh())
    }

    const off = nuxt.hook('app:data:refresh', (keys) => {
      if (!keys || keys.includes(key)) {
        return payload.refresh()
      }
    })

    if (instance) {
      onUnmounted(off)
    }
  }

  // Combine our promise with the payload so pending is still returned if the function is not awaited
  return Object.assign(promise.then(() => payload), payload) as AsyncData<PickFrom<ReturnType<Transform>, PickKeys>, DataE>
}

export function useLazyAsyncData<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
> (
  key: string,
  handler: (ctx?: NuxtApp) => Promise<DataT>,
  options: Omit<AsyncDataOptions<DataT, Transform, PickKeys>, 'lazy'> = {}
): AsyncData<PickFrom<ReturnType<Transform>, PickKeys>, DataE | null | true> {
  return useAsyncData(key, handler, { ...options, lazy: true })
}

export function refreshNuxtData (keys?: string | string[]): Promise<void> {
  if (process.server) {
    return Promise.resolve()
  }
  const _keys = keys ? Array.isArray(keys) ? keys : [keys] : undefined
  return useNuxtApp().callHook('app:data:refresh', _keys)
}

function pick (obj: Record<string, any>, keys: string[]) {
  const newObj = {}
  for (const key of keys) {
    newObj[key] = obj[key]
  }
  return newObj
}
