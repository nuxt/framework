import type { FetchOptions } from 'ohmyfetch'
import type { $Fetch } from '@nuxt/nitro'
import type { AsyncDataOptions, SelectorsOf } from './asyncData'
import { useAsyncData } from './asyncData'

type UseFetchOptions<T, Transform extends (res: T) => any = (res: T) => T, Selectors extends SelectorsOf<ReturnType<Transform>> = SelectorsOf<ReturnType<Transform>>> = AsyncDataOptions<T, Transform, Selectors> & FetchOptions & { key?: string }

type Awaited<T> = T extends Promise<infer U> ? U : T

export function useFetch<ReqT extends string = string, ResT = Awaited<ReturnType<$Fetch<unknown, ReqT>>>, Transform extends (res: ResT) => any = (res: ResT) => ResT, Selectors extends SelectorsOf<ReturnType<Transform>> = SelectorsOf<ReturnType<Transform>>> (url: ReqT, opts: UseFetchOptions<ResT, Transform, Selectors> = {}) {
  if (!opts.key) {
    const keys: any = { u: url }
    if (opts.baseURL) {
      keys.b = opts.baseURL
    }
    if (opts.method && opts.method.toLowerCase() !== 'get') {
      keys.m = opts.method.toLowerCase()
    }
    if (opts.params) {
      keys.p = opts.params
    }
    opts.key = generateKey(keys)
  }

  return useAsyncData('$f' + opts.key, () => $fetch(url, opts) as Promise<ResT>, opts)
}

// TODO: More predictable universal hash
function generateKey (keys) {
  return JSON.stringify(keys).replace(/[{":}=/,]|https?:\/\//g, '_').replace(/_+/g, '_')
}
