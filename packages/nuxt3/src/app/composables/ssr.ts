/* eslint-disable no-redeclare */
import { useNuxtApp } from '#app'

export function useReqHeaders<K extends string = string> (include: K[]): Record<K, string>;
export function useReqHeaders (): Readonly<Record<string, string>>;
export function useReqHeaders (include?) {
  if (process.client) { return {} }
  const headers: Record<string, string> = useNuxtApp().ssrContext?.req.headers ?? {}
  if (!include) { return headers }
  return Object.fromEntries(include.map(key => [key, headers[key]]))
}
