import { useNuxtApp } from '#app'

function filterByKey<T extends Record<string, any>, IncludeKey extends keyof T = keyof T, ExcludeKey extends keyof T = never> (source: T, opts?: {
  exclude?: ExcludeKey[]
  include?: IncludeKey[]
}) {
  return Object.fromEntries(Object.entries(source).filter(([key]) => {
    key = key.toLowerCase()
    if (opts.exclude && opts.exclude.includes(key as any)) {
      return false
    }
    if (opts.include && !opts.include.includes(key as any)) {
      return false
    }
    return true
  })) as Pick<T, Exclude<IncludeKey, ExcludeKey>>
}

export const useReqHeaders = <K extends string = string>(opts?: {
  exclude?: string[]
  include?: K[]
}): Readonly<Partial<Record<K, string>>> => {
  if (process.client) { return {} as Readonly<Partial<Record<K, string>>> }

  const nuxtApp = useNuxtApp()
  const headers: Record<string, string> = nuxtApp.ssrContext?.req.headers ?? {}
  if (!opts) {
    return headers as Readonly<Partial<Record<K, string>>>
  }

  return filterByKey(headers, {
    exclude: opts.exclude?.map(key => key.toLowerCase()),
    include: opts.include?.map(key => key.toLowerCase())
  }) as Readonly<Partial<Record<K, string>>>
}
