import { useNuxtApp } from '#app'

export const useReqHeaders = (opts?: {
  exclude?: string[]
  include?: string[]
}): Readonly<Record<string, string>> => {
  if (process.client) { return {} }

  const nuxtApp = useNuxtApp()
  const headers: Record<string, string> = nuxtApp.ssrContext?.req.headers ?? {}
  if (!opts) {
    return headers
  }

  opts.exclude = opts.exclude?.map(key => key.toLowerCase())
  opts.include = opts.include?.map(key => key.toLowerCase())

  return Object.fromEntries(Object.entries(headers).filter(([key]) => {
    key = key.toLowerCase()
    if (opts.exclude && opts.exclude.includes(key)) {
      return false
    }
    if (opts.include && !opts.include.includes(key)) {
      return false
    }
    return true
  }))
}
