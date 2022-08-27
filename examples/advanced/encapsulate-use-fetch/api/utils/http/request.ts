import { Ref } from '@vue/runtime-dom'
import type { NitroFetchRequest } from 'nitropack'
import { KeyOfRes } from 'nuxt/dist/app/composables/asyncData'

type UseFetchOptions = {
    key?: string,
    method?: string,
    params?: any,
    body?: RequestInit['body'] | Record<string, any>
    headers?: { key: string, value: string },
    baseURL?: string,
    server?: boolean
    lazy?: boolean
    default?: () => DataT
    transform?: (input: DataT) => DataT
    pick?: KeyOfRes<(input: DataT) => DataT>
}

interface DTOModel {
    comments: any,
    comments_count: number,
    id: number,
    points: number,
    time: number,
    title: string,
    type: string,
    url: string,
    user: string,
}

type DataT = {
    data: Ref<DTOModel>
    pending: Ref<boolean>
    refresh: () => Promise<void>
    error: Ref<Error | boolean>
}

export function request<T = any>(url: NitroFetchRequest | Ref<NitroFetchRequest> | (() => NitroFetchRequest), options?: UseFetchOptions): Promise<T> {
    return new Promise(resolve => {
        // Default configuration and merge
        const opts = {
            // key: `${new Date().getTime()}`,
            // method: 'GET',
            // params: {},
            // body: {},
            // headers: {},
            baseURL: 'https://hn.nuxtjs.org',
            server: true,
            lazy: false,
            // default: () => ({}),
            // transform: (input: any) => input,
            // pick: [],
            ...options
        }
        const { data, pending, error, refresh } = useFetch(url, opts)
        // @ts-ignore
        resolve({ data, pending, error, refresh })
    })
}
