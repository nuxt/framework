import type { FetchOptions } from 'ohmyfetch'
import type { $Fetch } from '@nuxt/nitro'
import type { AsyncData, AsyncDataOptions } from './asyncData'
import { useAsyncData } from './asyncData'

type UseFetchOptions<ResT> = AsyncDataOptions<ResT> & FetchOptions & {
  key?: string
}

export function useFetch<ReqT extends string = string, ResT = ReturnType<$Fetch<unknown, ReqT>>> (url: ReqT, opts: UseFetchOptions<ResT> = {}): AsyncData<ResT> {
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

  return useAsyncData<ResT>('$f' + opts.key, () => $fetch(url, opts) as Promise<ResT>)
}

// TODO: More predictable universal hash
function generateKey (keys) {
  return JSON.stringify(keys).replace(/[{":}=/,]|https?:\/\//g, '_').replace(/_+/g, '_')
}
