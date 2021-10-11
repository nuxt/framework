import type { FetchOptions } from 'ohmyfetch'
import type { $Fetch } from '@nuxt/nitro'
import type { AsyncData, AsyncDataOptions } from './asyncData'
import { useAsyncData } from './asyncData'

type UseFetchOptions<ResT> = AsyncDataOptions<ResT> & FetchOptions & {
  fetchKey?: string
  transform?: (res: any) => ResT
  pick?: string[]
}

export function useFetch<ReqT extends string = string, ResT = ReturnType<$Fetch<unknown, ReqT>>> (url: ReqT, opts: UseFetchOptions<ResT> = {}): AsyncData<ResT> {
  if (!opts.fetchKey) {
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
    opts.fetchKey = generateKey(keys)
  }

  return useAsyncData<ResT>('$f' + opts.fetchKey, () => {
    return $fetch(url, opts).then((res) => {
      if (opts.transform) {
        res = opts.transform(res)
      }
      if (opts.pick) {
        res = pick(res, opts.pick)
      }
      return res
    }) as Promise<ResT>
  })
}

// TODO: More predictable universal hash
function generateKey (keys) {
  return JSON.stringify(keys).replace(/[{":}=/,]|https?:\/\//g, '_').replace(/_+/g, '_')
}

function pick (obj: Record<string, any>, keys: string[]) {
  const newObj = {}
  for (const key of keys) {
    newObj[key] = obj[key]
  }
  return newObj
}
