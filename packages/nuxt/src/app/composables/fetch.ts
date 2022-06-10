import type { FetchOptions, FetchRequest } from 'ohmyfetch'
import type { TypedInternalResponse, NitroFetchRequest } from 'nitropack'
import { hash } from 'ohash'
import { computed, isRef, Ref } from 'vue'
import type { AsyncDataOptions, _Transform, KeyOfRes } from './asyncData'
import { useAsyncData } from './asyncData'

export type FetchResult<ReqT extends NitroFetchRequest> = TypedInternalResponse<ReqT, unknown>

export interface UseFetchOptions<
  DataT,
  Transform extends _Transform<DataT, any> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
> extends AsyncDataOptions<DataT, Transform, PickKeys>, FetchOptions {
  key?: string
}

export function useFetch<
  ResT = void,
  ErrorT = Error,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
  Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
> (
  request: Ref<ReqT> | ReqT | (() => ReqT),
  opts: UseFetchOptions<_ResT, Transform, PickKeys> = {}
) {
  if (process.dev && opts.transform && !opts.key) {
    console.warn('[nuxt] You should provide a key for `useFetch` when using a custom transform function.')
  }
  const key = '$f_' + (opts.key || hash([request, { ...opts, transform: null }]))
  const _request = computed(() => {
    let r = request as Ref<FetchRequest> | FetchRequest | (() => FetchRequest)
    if (typeof r === 'function') {
      r = r()
    }
    return (isRef(r) ? r.value : r) as NitroFetchRequest
  })

  const _fetchOptions = {
    ...opts,
    cache: typeof opts.cache === 'boolean' ? undefined : opts.cache
  }

  const _asyncDataOptions: AsyncDataOptions<_ResT, Transform, PickKeys> = {
    ...opts,
    watch: [
      _request,
      ...(opts.watch || [])
    ]
  }

  const asyncData = useAsyncData<_ResT, ErrorT, Transform, PickKeys>(key, () => {
    return $fetch(_request.value, _fetchOptions)
  }, _asyncDataOptions)

  return asyncData
}

export function useLazyFetch<
  ResT = void,
  ErrorT = Error,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
  Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
> (
  request: Ref<ReqT> | ReqT | (() => ReqT),
  opts: Omit<UseFetchOptions<_ResT, Transform, PickKeys>, 'lazy'> = {}
) {
  return useFetch<ResT, ErrorT, ReqT, _ResT, Transform, PickKeys>(request, {
    ...opts,
    lazy: true
  })
}
